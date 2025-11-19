import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IntuneDevice {
  id: string
  deviceName: string
  operatingSystem: string
  osVersion: string
  complianceState: string
  managedDeviceOwnerType: string
  lastSyncDateTime: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user')
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('Organization not found')
    }

    const { data: connection } = await supabaseClient
      .from('api_connections')
      .select('config')
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'microsoft')
      .single()

    if (!connection?.config) {
      throw new Error('Microsoft API not configured')
    }

    console.log('Starting Microsoft device sync for organization:', profile.organization_id)

    await supabaseClient
      .from('api_connections')
      .update({
        sync_status: 'syncing',
        error_message: null
      })
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'microsoft')

    // Fetch devices from Intune API
    const accessToken = connection.config.access_token
    const deviceResponse = await fetch('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!deviceResponse.ok) {
      throw new Error(`Intune API error: ${deviceResponse.statusText}`)
    }

    const deviceData = await deviceResponse.json()
    const devices: IntuneDevice[] = deviceData.value || []

    console.log(`Fetched ${devices.length} devices from Intune`)

    // Map compliance state to our format
    const mapComplianceState = (state: string): 'compliant' | 'non_compliant' | 'unknown' => {
      if (state === 'compliant') return 'compliant'
      if (state === 'noncompliant') return 'non_compliant'
      return 'unknown'
    }

    const deviceRecords = devices.map(device => ({
      organization_id: profile.organization_id,
      external_id: device.id,
      device_name: device.deviceName || 'Unknown Device',
      device_type: device.managedDeviceOwnerType || 'unknown',
      os: device.operatingSystem || null,
      os_version: device.osVersion || null,
      provider: 'microsoft',
      compliance_status: mapComplianceState(device.complianceState),
      last_check: device.lastSyncDateTime || null,
      last_synced: new Date().toISOString()
    }))

    const { error: upsertError } = await supabaseClient
      .from('device_inventory')
      .upsert(deviceRecords, {
        onConflict: 'organization_id,external_id,provider',
        ignoreDuplicates: false
      })

    if (upsertError) {
      throw upsertError
    }

    await supabaseClient
      .from('api_connections')
      .update({
        sync_status: 'success',
        last_sync: new Date().toISOString(),
        error_message: null
      })
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'microsoft')

    console.log('Microsoft device sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        devices_synced: deviceRecords.length,
        compliant_count: deviceRecords.filter(d => d.compliance_status === 'compliant').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Microsoft device sync error:', error)

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})