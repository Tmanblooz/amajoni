import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleUser {
  id: string
  primaryEmail: string
  name: {
    fullName: string
  }
  suspended: boolean
  isEnrolledIn2Sv: boolean
  lastLoginTime?: string
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

    console.log('Starting Google IAM sync for organization:', profile.organization_id)

    await supabaseClient
      .from('api_connections')
      .update({
        sync_status: 'syncing',
        error_message: null
      })
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'google')

    // Fetch users from Google Admin API
    const accessToken = connection.config.access_token
    const domain = connection.config.domain || 'primary'
    
    const adminResponse = await fetch(
      `https://admin.googleapis.com/admin/directory/v1/users?domain=${domain}&projection=full`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!adminResponse.ok) {
      throw new Error(`Google Admin API error: ${adminResponse.statusText}`)
    }

    const adminData = await adminResponse.json()
    const users: GoogleUser[] = adminData.users || []

    console.log(`Fetched ${users.length} users from Google`)

    // Store in database
    const iamRecords = users.map(user => ({
      organization_id: profile.organization_id,
      external_id: user.id,
      email: user.primaryEmail,
      display_name: user.name.fullName || null,
      provider: 'google',
      mfa_enabled: user.isEnrolledIn2Sv || false,
      last_sign_in: user.lastLoginTime || null,
      account_enabled: !user.suspended,
      last_synced: new Date().toISOString()
    }))

    const { error: upsertError } = await supabaseClient
      .from('iam_users')
      .upsert(iamRecords, {
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

    console.log('Google IAM sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        users_synced: iamRecords.length,
        mfa_enabled_count: iamRecords.filter(u => u.mfa_enabled).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Google IAM sync error:', error)

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})