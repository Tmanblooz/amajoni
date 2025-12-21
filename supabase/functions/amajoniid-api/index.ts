const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory state for demo purposes
let systemState = {
  isUnderAttack: false,
  threatType: null as string | null,
  attackStartTime: null as number | null,
  alerts: [] as any[],
};

function generateBaseMetrics() {
  return {
    riskScore: systemState.isUnderAttack ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 15) + 25,
    grade: systemState.isUnderAttack ? "D" : "B+",
    activeAlerts: systemState.isUnderAttack ? Math.floor(Math.random() * 5) + 8 : Math.floor(Math.random() * 3) + 1,
    shadowApps: Math.floor(Math.random() * 5) + 3,
    devicesSecure: `${Math.floor(Math.random() * 10) + 85}%`,
    lastScan: new Date().toISOString(),
    isUnderAttack: systemState.isUnderAttack,
    threatType: systemState.threatType,
    mfaPercentage: systemState.isUnderAttack ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 10) + 85,
    totalUsers: 156,
    failedLogins: systemState.isUnderAttack ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 5) + 2,
    inactiveAccounts: Math.floor(Math.random() * 10) + 5,
  };
}

function generateAlerts() {
  const baseAlerts = [
    {
      id: "alert-1",
      title: "Unusual Login Pattern",
      severity: "medium",
      message: "Multiple failed login attempts detected from new IP range",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "alert-2", 
      title: "Shadow App Detected",
      severity: "low",
      message: "Unauthorized SaaS application connected to corporate account",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ];

  if (systemState.isUnderAttack) {
    const attackAlerts = [
      {
        id: "attack-1",
        title: "🚨 CRITICAL: Financial Theft Attempt",
        severity: "critical",
        message: `Active ${systemState.threatType} attack detected! Suspicious fund transfer initiated.`,
        timestamp: new Date().toISOString(),
      },
      {
        id: "attack-2",
        title: "Compromised Account Activity",
        severity: "critical", 
        message: "Finance team account showing impossible travel pattern",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      },
      {
        id: "attack-3",
        title: "Privilege Escalation Detected",
        severity: "high",
        message: "Unauthorized elevation of permissions on financial systems",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ];
    return [...attackAlerts, ...baseAlerts];
  }

  return baseAlerts;
}

function handleSimulation(scenario: string) {
  systemState.isUnderAttack = true;
  systemState.threatType = scenario;
  systemState.attackStartTime = Date.now();
  
  console.log(`Simulation started: ${scenario}`);
  
  return { success: true, message: `Simulation "${scenario}" triggered` };
}

function handleReset() {
  systemState = {
    isUnderAttack: false,
    threatType: null,
    attackStartTime: null,
    alerts: [],
  };
  
  console.log("System reset");
  
  return { success: true, message: "System reset to baseline" };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/dashboard';
    
    console.log(`Request: ${req.method} ${path}`);

    // Route: /dashboard
    if (path === '/dashboard') {
      const data = generateBaseMetrics();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /alerts
    if (path === '/alerts') {
      const alerts = generateAlerts();
      return new Response(JSON.stringify(alerts), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /simulate
    if (path === '/simulate') {
      const result = handleSimulation(body.scenario || 'unknown');
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /reset
    if (path === '/reset') {
      const result = handleReset();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
