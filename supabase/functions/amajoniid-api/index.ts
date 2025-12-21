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

// Sample user data
const users = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@company.com", department: "Finance", role: "CFO", riskScore: 15, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "active" },
  { id: "u2", name: "Michael Torres", email: "m.torres@company.com", department: "Engineering", role: "Developer", riskScore: 25, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "active" },
  { id: "u3", name: "Emily Watson", email: "e.watson@company.com", department: "HR", role: "Manager", riskScore: 12, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "active" },
  { id: "u4", name: "James Miller", email: "j.miller@company.com", department: "Sales", role: "Director", riskScore: 45, mfaEnabled: false, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: "inactive" },
  { id: "u5", name: "Lisa Park", email: "l.park@company.com", department: "IT", role: "Admin", riskScore: 8, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: "active" },
  { id: "u6", name: "David Kim", email: "d.kim@company.com", department: "Finance", role: "Analyst", riskScore: 72, mfaEnabled: false, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), status: "suspended" },
  { id: "u7", name: "Anna Schmidt", email: "a.schmidt@company.com", department: "Legal", role: "Counsel", riskScore: 18, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: "active" },
  { id: "u8", name: "Robert Brown", email: "r.brown@company.com", department: "Operations", role: "Manager", riskScore: 35, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), status: "active" },
];

// Sample devices
const devices = [
  { id: "d1", userId: "u1", type: "laptop", os: "macOS 14.2", browser: "Chrome 120", lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), compliant: true, encrypted: true },
  { id: "d2", userId: "u1", type: "mobile", os: "iOS 17.2", browser: "Safari", lastSeen: new Date(Date.now() - 1000 * 60 * 60).toISOString(), compliant: true, encrypted: true },
  { id: "d3", userId: "u2", type: "laptop", os: "Windows 11", browser: "Edge 120", lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), compliant: true, encrypted: true },
  { id: "d4", userId: "u4", type: "laptop", os: "Windows 10", browser: "Chrome 118", lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), compliant: false, encrypted: false },
  { id: "d5", userId: "u5", type: "desktop", os: "Ubuntu 22.04", browser: "Firefox 121", lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(), compliant: true, encrypted: true },
  { id: "d6", userId: "u6", type: "laptop", os: "macOS 13.1", browser: "Chrome 115", lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), compliant: false, encrypted: true },
];

// Shadow apps detected
const shadowApps = [
  { id: "sa1", name: "Dropbox Personal", category: "File Storage", users: 12, riskLevel: "medium", dataExposure: "possible", firstDetected: "2024-11-15" },
  { id: "sa2", name: "WhatsApp Web", category: "Communication", users: 45, riskLevel: "high", dataExposure: "likely", firstDetected: "2024-10-20" },
  { id: "sa3", name: "Notion Personal", category: "Productivity", users: 8, riskLevel: "low", dataExposure: "unlikely", firstDetected: "2024-12-01" },
  { id: "sa4", name: "ChatGPT", category: "AI Tools", users: 67, riskLevel: "high", dataExposure: "confirmed", firstDetected: "2024-09-10" },
  { id: "sa5", name: "Slack Connect", category: "Communication", users: 23, riskLevel: "medium", dataExposure: "possible", firstDetected: "2024-11-28" },
  { id: "sa6", name: "Canva", category: "Design", users: 15, riskLevel: "low", dataExposure: "unlikely", firstDetected: "2024-12-10" },
  { id: "sa7", name: "Trello Personal", category: "Project Management", users: 9, riskLevel: "medium", dataExposure: "possible", firstDetected: "2024-11-05" },
];

// Login events with geographic data
const loginEvents = [
  { id: "le1", userId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), location: "San Francisco, CA", country: "US", ip: "192.168.1.100", success: true, mfaUsed: true, device: "laptop" },
  { id: "le2", userId: "u2", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), location: "Austin, TX", country: "US", ip: "10.0.0.50", success: true, mfaUsed: true, device: "laptop" },
  { id: "le3", userId: "u6", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), location: "Lagos, Nigeria", country: "NG", ip: "41.58.12.34", success: false, mfaUsed: false, device: "unknown", suspicious: true },
  { id: "le4", userId: "u5", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), location: "New York, NY", country: "US", ip: "172.16.0.100", success: true, mfaUsed: true, device: "desktop" },
  { id: "le5", userId: "u4", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), location: "Moscow, Russia", country: "RU", ip: "95.173.45.67", success: false, mfaUsed: false, device: "unknown", suspicious: true },
  { id: "le6", userId: "u3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), location: "Chicago, IL", country: "US", ip: "192.168.2.50", success: true, mfaUsed: true, device: "laptop" },
  { id: "le7", userId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), location: "Tokyo, Japan", country: "JP", ip: "203.0.113.50", success: false, mfaUsed: false, device: "unknown", suspicious: true, impossibleTravel: true },
];

// Compliance status
const complianceData = {
  frameworks: [
    { name: "SOC 2 Type II", status: "compliant", lastAudit: "2024-10-15", nextAudit: "2025-04-15", score: 94 },
    { name: "ISO 27001", status: "compliant", lastAudit: "2024-08-20", nextAudit: "2025-08-20", score: 91 },
    { name: "GDPR", status: "partial", lastAudit: "2024-11-01", nextAudit: "2025-05-01", score: 78 },
    { name: "HIPAA", status: "non-compliant", lastAudit: "2024-09-10", nextAudit: "2025-03-10", score: 62 },
    { name: "PCI DSS", status: "compliant", lastAudit: "2024-12-01", nextAudit: "2025-06-01", score: 89 },
  ],
  policies: {
    passwordPolicy: { enabled: true, minLength: 12, requireMfa: true, maxAge: 90 },
    sessionPolicy: { timeout: 30, maxConcurrent: 3, geoRestrictions: true },
    dataRetention: { enabled: true, period: 365, autoDelete: true },
  },
};

// Security events timeline
const securityEvents = [
  { id: "se1", type: "failed_login", severity: "medium", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), description: "Multiple failed login attempts for user d.kim@company.com", userId: "u6" },
  { id: "se2", type: "impossible_travel", severity: "critical", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: "Impossible travel detected: SF to Tokyo in 5 hours", userId: "u1" },
  { id: "se3", type: "new_device", severity: "low", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), description: "New device registered for m.torres@company.com", userId: "u2" },
  { id: "se4", type: "privilege_escalation", severity: "high", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), description: "Unusual privilege escalation attempt detected", userId: "u4" },
  { id: "se5", type: "data_export", severity: "high", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), description: "Large data export from finance system", userId: "u6" },
  { id: "se6", type: "shadow_app", severity: "medium", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), description: "New shadow app detected: ChatGPT usage spike", userId: null },
  { id: "se7", type: "mfa_disabled", severity: "high", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: "MFA disabled for privileged account", userId: "u4" },
];

// Geographic threat data
const geoThreats = [
  { country: "US", loginAttempts: 1250, successRate: 98, threatLevel: "low", blockedIps: 12 },
  { country: "CN", loginAttempts: 89, successRate: 5, threatLevel: "high", blockedIps: 78 },
  { country: "RU", loginAttempts: 156, successRate: 3, threatLevel: "critical", blockedIps: 145 },
  { country: "NG", loginAttempts: 67, successRate: 8, threatLevel: "high", blockedIps: 52 },
  { country: "BR", loginAttempts: 34, successRate: 82, threatLevel: "medium", blockedIps: 5 },
  { country: "GB", loginAttempts: 189, successRate: 96, threatLevel: "low", blockedIps: 3 },
  { country: "DE", loginAttempts: 145, successRate: 94, threatLevel: "low", blockedIps: 8 },
  { country: "JP", loginAttempts: 78, successRate: 45, threatLevel: "medium", blockedIps: 23 },
];

function generateBaseMetrics() {
  const mfaUsers = users.filter(u => u.mfaEnabled).length;
  const activeUsers = users.filter(u => u.status === "active").length;
  
  return {
    riskScore: systemState.isUnderAttack ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 15) + 25,
    grade: systemState.isUnderAttack ? "D" : "B+",
    activeAlerts: systemState.isUnderAttack ? Math.floor(Math.random() * 5) + 8 : Math.floor(Math.random() * 3) + 1,
    shadowApps: shadowApps.length,
    devicesSecure: `${Math.round((devices.filter(d => d.compliant).length / devices.length) * 100)}%`,
    lastScan: new Date().toISOString(),
    isUnderAttack: systemState.isUnderAttack,
    threatType: systemState.threatType,
    mfaPercentage: Math.round((mfaUsers / users.length) * 100),
    totalUsers: users.length,
    activeUsers,
    failedLogins: systemState.isUnderAttack ? Math.floor(Math.random() * 50) + 30 : loginEvents.filter(e => !e.success).length,
    inactiveAccounts: users.filter(u => u.status !== "active").length,
    suspiciousLogins: loginEvents.filter(e => e.suspicious).length,
    complianceScore: Math.round(complianceData.frameworks.reduce((acc, f) => acc + f.score, 0) / complianceData.frameworks.length),
    criticalAlerts: securityEvents.filter(e => e.severity === "critical").length,
    highRiskUsers: users.filter(u => u.riskScore > 50).length,
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
      userId: "u6",
      category: "authentication",
    },
    {
      id: "alert-2", 
      title: "Shadow App Detected",
      severity: "low",
      message: "Unauthorized SaaS application connected to corporate account",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      category: "shadow_it",
    },
    {
      id: "alert-3",
      title: "Impossible Travel Alert",
      severity: "high",
      message: "User sarah.chen logged in from SF and Tokyo within 5 hours",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      userId: "u1",
      category: "authentication",
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
        category: "attack",
      },
      {
        id: "attack-2",
        title: "Compromised Account Activity",
        severity: "critical", 
        message: "Finance team account showing impossible travel pattern",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        userId: "u1",
        category: "attack",
      },
      {
        id: "attack-3",
        title: "Privilege Escalation Detected",
        severity: "high",
        message: "Unauthorized elevation of permissions on financial systems",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: "u4",
        category: "attack",
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

    // Route: /users
    if (path === '/users') {
      const userData = users.map(u => ({
        ...u,
        deviceCount: devices.filter(d => d.userId === u.id).length,
        recentEvents: securityEvents.filter(e => e.userId === u.id).length,
      }));
      return new Response(JSON.stringify(userData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /devices
    if (path === '/devices') {
      const deviceData = devices.map(d => ({
        ...d,
        userName: users.find(u => u.id === d.userId)?.name || "Unknown",
      }));
      return new Response(JSON.stringify(deviceData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /shadow-apps
    if (path === '/shadow-apps') {
      return new Response(JSON.stringify(shadowApps), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /login-events
    if (path === '/login-events') {
      const events = loginEvents.map(e => ({
        ...e,
        userName: users.find(u => u.id === e.userId)?.name || "Unknown",
      }));
      return new Response(JSON.stringify(events), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /compliance
    if (path === '/compliance') {
      return new Response(JSON.stringify(complianceData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /security-events
    if (path === '/security-events') {
      const events = securityEvents.map(e => ({
        ...e,
        userName: e.userId ? users.find(u => u.id === e.userId)?.name : null,
      }));
      return new Response(JSON.stringify(events), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /geo-threats
    if (path === '/geo-threats') {
      return new Response(JSON.stringify(geoThreats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: /analytics
    if (path === '/analytics') {
      const now = Date.now();
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: new Date(now - (23 - i) * 60 * 60 * 1000).toISOString(),
        logins: Math.floor(Math.random() * 50) + 10,
        failedLogins: Math.floor(Math.random() * 10),
        alerts: Math.floor(Math.random() * 5),
        riskScore: Math.floor(Math.random() * 30) + 20,
      }));
      return new Response(JSON.stringify({ hourlyData }), {
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
    return new Response(JSON.stringify({ error: 'Not found', availableRoutes: ['/dashboard', '/alerts', '/users', '/devices', '/shadow-apps', '/login-events', '/compliance', '/security-events', '/geo-threats', '/analytics', '/simulate', '/reset'] }), {
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
