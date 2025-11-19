import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MicrosoftUser {
  id: string
  userPrincipalName: string
  displayName: string
  accountEnabled: boolean
  signInActivity?: {
    lastSignInDateTime: string
  }
  // MFA status from authentication methods
  isMfaRegistered?: boolean
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user')
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('Organization not found')
    }

    // Get Microsoft credentials from api_connections
    const { data: connection } = await supabaseClient
      .from('api_connections')
      .select('config')
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'microsoft')
      .single()

    if (!connection?.config) {
      throw new Error('Microsoft API not configured')
    }

    console.log('Starting Microsoft IAM sync for organization:', profile.organization_id)

    // Update sync status
    await supabaseClient
      .from('api_connections')
      .update({
        sync_status: 'syncing',
        error_message: null
      })
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'microsoft')

    // Fetch users from Microsoft Graph API
    const accessToken = connection.config.access_token
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/users?$select=id,userPrincipalName,displayName,accountEnabled,signInActivity', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!graphResponse.ok) {
      throw new Error(`Microsoft Graph API error: ${graphResponse.statusText}`)
    }

    const graphData = await graphResponse.json()
    const users: MicrosoftUser[] = graphData.value || []

    console.log(`Fetched ${users.length} users from Microsoft`)

    // For each user, check MFA status
    const usersWithMfa = await Promise.all(users.map(async (user) => {
      try {
        const mfaResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${user.id}/authentication/methods`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (mfaResponse.ok) {
          const mfaData = await mfaResponse.json()
          // Check if user has any MFA methods registered (besides password)
          const hasMfa = mfaData.value?.some((method: any) => 
            method['@odata.type'] !== '#microsoft.graph.passwordAuthenticationMethod'
          ) || false

          return { ...user, isMfaRegistered: hasMfa }
        }
      } catch (error) {
        console.error(`Error fetching MFA for user ${user.id}:`, error)
      }
      return { ...user, isMfaRegistered: false }
    }))

    // Store in database
    const iamRecords = usersWithMfa.map(user => ({
      organization_id: profile.organization_id,
      external_id: user.id,
      email: user.userPrincipalName,
      display_name: user.displayName || null,
      provider: 'microsoft',
      mfa_enabled: user.isMfaRegistered || false,
      last_sign_in: user.signInActivity?.lastSignInDateTime || null,
      account_enabled: user.accountEnabled,
      last_synced: new Date().toISOString()
    }))

    // Upsert users
    const { error: upsertError } = await supabaseClient
      .from('iam_users')
      .upsert(iamRecords, {
        onConflict: 'organization_id,external_id,provider',
        ignoreDuplicates: false
      })

    if (upsertError) {
      throw upsertError
    }

    // Update sync status to success
    await supabaseClient
      .from('api_connections')
      .update({
        sync_status: 'success',
        last_sync: new Date().toISOString(),
        error_message: null
      })
      .eq('organization_id', profile.organization_id)
      .eq('provider', 'microsoft')

    console.log('Microsoft IAM sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        users_synced: iamRecords.length,
        mfa_enabled_count: iamRecords.filter(u => u.mfa_enabled).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Microsoft IAM sync error:', error)

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})