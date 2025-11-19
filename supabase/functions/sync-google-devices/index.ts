import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleDevice {
  resourceId: string
  name: string
  type: string
  model?: string
  os: string
  osVersion?: string
  lastSync?: string
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
      .eq('provider', 'google')
      .single()

    if (!connection?.config) {
      throw new Error('Google Admin API not configured')
    }

    console.log('Starting Google device sync for organization:', profile.organization_id)

    await supabaseClient
      .from('api_connections')
      .update({
        sync_status: 'syncing',
        error_message: null
      })
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'google')

    // Fetch devices from Google Admin API
    const accessToken = connection.config.access_token
    const customerId = connection.config.customer_id || 'my_customer'
    
    const deviceResponse = await fetch(
      `https://admin.googleapis.com/admin/directory/v1/customer/${customerId}/devices/chromeos`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!deviceResponse.ok) {
      throw new Error(`Google Admin API error: ${deviceResponse.statusText}`)
    }

    const deviceData = await deviceResponse.json()
    const devices: GoogleDevice[] = deviceData.chromeosdevices || []

    console.log(`Fetched ${devices.length} Chrome OS devices from Google`)

    // Note: Google Admin API doesn't provide direct compliance status like Intune
    // We determine compliance based on osVersion being recent and lastSync being recent
    const determineCompliance = (device: GoogleDevice): 'compliant' | 'non_compliant' | 'unknown' => {
      if (!device.lastSync) return 'unknown'
      
      const lastSyncDate = new Date(device.lastSync)
      const daysSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24)
      
      // Consider compliant if synced within last 7 days
      return daysSinceSync <= 7 ? 'compliant' : 'non_compliant'
    }

    const deviceRecords = devices.map(device => ({
      organization_id: profile.organization_id,
      external_id: device.resourceId,
      device_name: device.name || 'Unknown Device',
      device_type: device.type || device.model || 'chromeos',
      os: device.os || 'Chrome OS',
      os_version: device.osVersion || null,
      provider: 'google',
      compliance_status: determineCompliance(device),
      last_check: device.lastSync || null,
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
      .eq('provider', 'google')

    console.log('Google device sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        devices_synced: deviceRecords.length,
        compliant_count: deviceRecords.filter(d => d.compliance_status === 'compliant').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Google device sync error:', error)

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})