import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MicrosoftSignIn {
  id: string;
  createdDateTime: string;
  userPrincipalName: string;
  userDisplayName: string;
  ipAddress: string;
  location: {
    city?: string;
    countryOrRegion?: string;
    geoCoordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  deviceDetail?: {
    browser?: string;
    operatingSystem?: string;
    deviceId?: string;
  };
  status: {
    errorCode: number;
    failureReason?: string;
  };
  riskDetail?: string;
  riskLevelDuringSignIn?: string;
}

interface GoogleSignIn {
  id: { time: string; uniqueQualifier: string };
  actor: { email: string; profileId: string };
  ipAddress: string;
  events: Array<{
    name: string;
    parameters?: Array<{ name: string; value?: string }>;
  }>;
}

// Risk detection rules
function detectRisks(signIn: {
  ip_address?: string;
  location_country?: string;
  sign_in_time: string;
  status: string;
  previous_countries?: string[];
}): { is_suspicious: boolean; risk_level: string; risk_factors: string[] } {
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Check for failed login
  if (signIn.status === 'failure') {
    riskFactors.push('Failed login attempt');
    riskScore += 1;
  }

  // Check for unusual hour (outside 6am-10pm local time approximation)
  const hour = new Date(signIn.sign_in_time).getUTCHours();
  if (hour < 5 || hour > 22) {
    riskFactors.push('Login outside business hours');
    riskScore += 1;
  }

  // High-risk countries (example list)
  const highRiskCountries = ['RU', 'CN', 'KP', 'IR'];
  if (signIn.location_country && highRiskCountries.includes(signIn.location_country)) {
    riskFactors.push('Login from high-risk country');
    riskScore += 3;
  }

  // Impossible travel detection (if we have previous countries)
  if (signIn.previous_countries && signIn.previous_countries.length > 0) {
    const lastCountry = signIn.previous_countries[0];
    if (signIn.location_country && lastCountry !== signIn.location_country) {
      riskFactors.push('Possible impossible travel detected');
      riskScore += 2;
    }
  }

  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 4) riskLevel = 'critical';
  else if (riskScore >= 3) riskLevel = 'high';
  else if (riskScore >= 2) riskLevel = 'medium';

  return {
    is_suspicious: riskScore >= 2,
    risk_level: riskLevel,
    risk_factors: riskFactors,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user and organization
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication failed');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found');
    }

    const { provider } = await req.json();
    console.log(`Syncing sign-in logs for provider: ${provider}`);

    // Get API connection config
    const { data: connection } = await supabaseClient
      .from('api_connections')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('provider', provider)
      .single();

    if (!connection?.enabled) {
      throw new Error(`${provider} connection not enabled`);
    }

    const config = connection.config as { access_token?: string; customer_id?: string };
    
    // Update sync status
    await supabaseClient
      .from('api_connections')
      .update({ sync_status: 'syncing' })
      .eq('id', connection.id);

    let signInLogs: Array<{
      organization_id: string;
      external_user_id: string;
      email: string;
      provider: string;
      sign_in_time: string;
      ip_address: string | null;
      location_city: string | null;
      location_country: string | null;
      location_coordinates: object | null;
      device_info: object | null;
      user_agent: string | null;
      status: string;
      is_suspicious: boolean;
      risk_level: string;
      risk_factors: string[];
    }> = [];

    if (provider === 'microsoft') {
      // Fetch Microsoft sign-in logs
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/auditLogs/signIns?$top=100&$orderby=createdDateTime desc',
        {
          headers: {
            Authorization: `Bearer ${config.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Microsoft API error: ${errorText}`);
      }

      const data = await response.json();
      const signIns: MicrosoftSignIn[] = data.value || [];

      // Get recent countries for impossible travel detection
      const { data: recentLogs } = await supabaseClient
        .from('sign_in_logs')
        .select('email, location_country, sign_in_time')
        .eq('organization_id', profile.organization_id)
        .order('sign_in_time', { ascending: false })
        .limit(100);

      const recentCountriesByEmail: Record<string, string[]> = {};
      recentLogs?.forEach(log => {
        if (!recentCountriesByEmail[log.email]) {
          recentCountriesByEmail[log.email] = [];
        }
        if (log.location_country) {
          recentCountriesByEmail[log.email].push(log.location_country);
        }
      });

      signInLogs = signIns.map((signIn) => {
        const status = signIn.status.errorCode === 0 ? 'success' : 'failure';
        const riskAnalysis = detectRisks({
          ip_address: signIn.ipAddress,
          location_country: signIn.location?.countryOrRegion,
          sign_in_time: signIn.createdDateTime,
          status,
          previous_countries: recentCountriesByEmail[signIn.userPrincipalName],
        });

        return {
          organization_id: profile.organization_id,
          external_user_id: signIn.id,
          email: signIn.userPrincipalName,
          provider: 'microsoft',
          sign_in_time: signIn.createdDateTime,
          ip_address: signIn.ipAddress || null,
          location_city: signIn.location?.city || null,
          location_country: signIn.location?.countryOrRegion || null,
          location_coordinates: signIn.location?.geoCoordinates || null,
          device_info: signIn.deviceDetail || null,
          user_agent: signIn.deviceDetail?.browser || null,
          status,
          is_suspicious: riskAnalysis.is_suspicious,
          risk_level: riskAnalysis.risk_level,
          risk_factors: riskAnalysis.risk_factors,
        };
      });
    } else if (provider === 'google') {
      // Fetch Google login activity
      const response = await fetch(
        `https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/login?maxResults=100`,
        {
          headers: {
            Authorization: `Bearer ${config.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API error: ${errorText}`);
      }

      const data = await response.json();
      const activities: GoogleSignIn[] = data.items || [];

      signInLogs = activities.map((activity) => {
        const loginEvent = activity.events?.find(e => e.name === 'login_success' || e.name === 'login_failure');
        const status = loginEvent?.name === 'login_success' ? 'success' : 'failure';
        
        const riskAnalysis = detectRisks({
          ip_address: activity.ipAddress,
          sign_in_time: activity.id.time,
          status,
        });

        return {
          organization_id: profile.organization_id,
          external_user_id: activity.id.uniqueQualifier,
          email: activity.actor.email,
          provider: 'google',
          sign_in_time: activity.id.time,
          ip_address: activity.ipAddress || null,
          location_city: null,
          location_country: null,
          location_coordinates: null,
          device_info: null,
          user_agent: null,
          status,
          is_suspicious: riskAnalysis.is_suspicious,
          risk_level: riskAnalysis.risk_level,
          risk_factors: riskAnalysis.risk_factors,
        };
      });
    }

    // Upsert sign-in logs
    if (signInLogs.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('sign_in_logs')
        .upsert(signInLogs, { 
          onConflict: 'organization_id,external_user_id,provider',
          ignoreDuplicates: true 
        });

      if (upsertError) {
        console.error('Error upserting sign-in logs:', upsertError);
      }

      // Create alerts for suspicious logins
      const suspiciousLogs = signInLogs.filter(log => log.is_suspicious);
      if (suspiciousLogs.length > 0) {
        const alerts = suspiciousLogs.map(log => ({
          organization_id: profile.organization_id,
          email: log.email,
          alert_type: log.risk_factors[0] || 'Suspicious activity',
          severity: log.risk_level,
          title: `Suspicious login detected for ${log.email}`,
          description: `Risk factors: ${log.risk_factors.join(', ')}`,
          recommended_action: log.risk_level === 'critical' || log.risk_level === 'high'
            ? 'Immediately reset password and enable MFA'
            : 'Review account activity and consider enabling MFA',
          status: 'open',
        }));

        await supabaseClient
          .from('identity_alerts')
          .insert(alerts);
      }
    }

    // Update sync status
    await supabaseClient
      .from('api_connections')
      .update({ 
        sync_status: 'success',
        last_sync: new Date().toISOString(),
        error_message: null
      })
      .eq('id', connection.id);

    console.log(`Synced ${signInLogs.length} sign-in logs, ${signInLogs.filter(l => l.is_suspicious).length} suspicious`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: signInLogs.length,
        suspicious: signInLogs.filter(l => l.is_suspicious).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing sign-in logs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});