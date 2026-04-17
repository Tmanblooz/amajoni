const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// In-memory state (demo) — multi-stage attack engine
// ============================================================

interface AttackStage {
  at: number;        // ms offset from attack start
  alert: any;        // alert object to push
  riskDelta?: number;
  message?: string;  // optional console log
}

interface Transaction {
  id: string;
  account: string;
  beneficiary: string;
  amount: number;
  currency: string;
  status: "approved" | "pending" | "blocked" | "flagged";
  risk: "low" | "medium" | "high" | "critical";
  timestamp: string;
  reason?: string;
}

interface BeneficiaryChange {
  id: string;
  account: string;
  oldBeneficiary: string;
  newBeneficiary: string;
  changedBy: string;
  timestamp: string;
  status: "approved" | "pending" | "suspicious";
}

let systemState = {
  isUnderAttack: false,
  threatType: null as string | null,
  attackStartTime: null as number | null,
  scenario: null as string | null,
  stages: [] as AttackStage[],
  firedStageIds: new Set<string>(),
  dynamicAlerts: [] as any[],
  resolvedAlertIds: new Set<string>(),
  acknowledgedAlertIds: new Set<string>(),
  riskTrend: [] as { t: string; score: number }[],
  flaggedTransactions: [] as Transaction[],
  beneficiaryChanges: [] as BeneficiaryChange[],
};

// Seed an initial 24-point risk trend (hourly)
(function seedTrend() {
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    systemState.riskTrend.push({
      t: new Date(now - i * 60 * 60 * 1000).toISOString(),
      score: 22 + Math.floor(Math.random() * 12),
    });
  }
})();

// ============================================================
// Static reference data
// ============================================================

const users = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@company.co.za", department: "Finance", role: "CFO", riskScore: 15, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "active" },
  { id: "u2", name: "Michael Torres", email: "m.torres@company.co.za", department: "Engineering", role: "Developer", riskScore: 25, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "active" },
  { id: "u3", name: "Emily Watson", email: "e.watson@company.co.za", department: "HR", role: "Manager", riskScore: 12, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "active" },
  { id: "u4", name: "James Miller", email: "j.miller@company.co.za", department: "Sales", role: "Director", riskScore: 45, mfaEnabled: false, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: "inactive" },
  { id: "u5", name: "Lisa Park", email: "l.park@company.co.za", department: "IT", role: "Admin", riskScore: 8, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: "active" },
  { id: "u6", name: "David Kim", email: "d.kim@company.co.za", department: "Finance", role: "Analyst", riskScore: 72, mfaEnabled: false, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), status: "suspended" },
  { id: "u7", name: "Anna Schmidt", email: "a.schmidt@company.co.za", department: "Legal", role: "Counsel", riskScore: 18, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: "active" },
  { id: "u8", name: "Robert Brown", email: "r.brown@company.co.za", department: "Operations", role: "Manager", riskScore: 35, mfaEnabled: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), status: "active" },
];

const devices = [
  { id: "d1", userId: "u1", type: "laptop", os: "macOS 14.2", browser: "Chrome 120", lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), compliant: true, encrypted: true },
  { id: "d2", userId: "u1", type: "mobile", os: "iOS 17.2", browser: "Safari", lastSeen: new Date(Date.now() - 1000 * 60 * 60).toISOString(), compliant: true, encrypted: true },
  { id: "d3", userId: "u2", type: "laptop", os: "Windows 11", browser: "Edge 120", lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), compliant: true, encrypted: true },
  { id: "d4", userId: "u4", type: "laptop", os: "Windows 10", browser: "Chrome 118", lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), compliant: false, encrypted: false },
  { id: "d5", userId: "u5", type: "desktop", os: "Ubuntu 22.04", browser: "Firefox 121", lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(), compliant: true, encrypted: true },
  { id: "d6", userId: "u6", type: "laptop", os: "macOS 13.1", browser: "Chrome 115", lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), compliant: false, encrypted: true },
];

const shadowApps = [
  { id: "sa1", name: "Dropbox Personal", category: "File Storage", users: 12, riskLevel: "medium", dataExposure: "possible", firstDetected: "2024-11-15" },
  { id: "sa2", name: "WhatsApp Web", category: "Communication", users: 45, riskLevel: "high", dataExposure: "likely", firstDetected: "2024-10-20" },
  { id: "sa3", name: "Notion Personal", category: "Productivity", users: 8, riskLevel: "low", dataExposure: "unlikely", firstDetected: "2024-12-01" },
  { id: "sa4", name: "ChatGPT", category: "AI Tools", users: 67, riskLevel: "high", dataExposure: "confirmed", firstDetected: "2024-09-10" },
  { id: "sa5", name: "Slack Connect", category: "Communication", users: 23, riskLevel: "medium", dataExposure: "possible", firstDetected: "2024-11-28" },
  { id: "sa6", name: "Canva", category: "Design", users: 15, riskLevel: "low", dataExposure: "unlikely", firstDetected: "2024-12-10" },
  { id: "sa7", name: "Trello Personal", category: "Project Management", users: 9, riskLevel: "medium", dataExposure: "possible", firstDetected: "2024-11-05" },
];

const loginEvents = [
  { id: "le1", userId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), location: "Cape Town, ZA", country: "ZA", ip: "192.168.1.100", success: true, mfaUsed: true, device: "laptop" },
  { id: "le2", userId: "u2", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), location: "Johannesburg, ZA", country: "ZA", ip: "10.0.0.50", success: true, mfaUsed: true, device: "laptop" },
  { id: "le3", userId: "u6", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), location: "Lagos, NG", country: "NG", ip: "41.58.12.34", success: false, mfaUsed: false, device: "unknown", suspicious: true },
  { id: "le4", userId: "u5", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), location: "Pretoria, ZA", country: "ZA", ip: "172.16.0.100", success: true, mfaUsed: true, device: "desktop" },
  { id: "le5", userId: "u4", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), location: "Moscow, RU", country: "RU", ip: "95.173.45.67", success: false, mfaUsed: false, device: "unknown", suspicious: true },
];

const complianceData = {
  frameworks: [
    { name: "POPIA", status: "compliant", lastAudit: "2024-10-15", nextAudit: "2025-04-15", score: 88 },
    { name: "ISO 27001", status: "compliant", lastAudit: "2024-08-20", nextAudit: "2025-08-20", score: 91 },
    { name: "GDPR", status: "partial", lastAudit: "2024-11-01", nextAudit: "2025-05-01", score: 78 },
    { name: "PCI DSS", status: "compliant", lastAudit: "2024-12-01", nextAudit: "2025-06-01", score: 89 },
  ],
};

const geoThreats = [
  { country: "ZA", loginAttempts: 1250, successRate: 98, threatLevel: "low", blockedIps: 12 },
  { country: "CN", loginAttempts: 89, successRate: 5, threatLevel: "high", blockedIps: 78 },
  { country: "RU", loginAttempts: 156, successRate: 3, threatLevel: "critical", blockedIps: 145 },
  { country: "NG", loginAttempts: 67, successRate: 8, threatLevel: "high", blockedIps: 52 },
];

// Baseline financial accounts
const protectedAccounts = [
  { id: "acc1", name: "TymeBank Business", balance: 482000, currency: "ZAR" },
  { id: "acc2", name: "FNB Commercial", balance: 1240000, currency: "ZAR" },
  { id: "acc3", name: "Standard Bank", balance: 765000, currency: "ZAR" },
  { id: "acc4", name: "Capitec Business", balance: 198000, currency: "ZAR" },
];

const baselineTransactions: Transaction[] = [
  { id: "tx-base-1", account: "TymeBank Business", beneficiary: "SARS PAYE", amount: 45200, currency: "ZAR", status: "approved", risk: "low", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: "tx-base-2", account: "FNB Commercial", beneficiary: "Eskom Account", amount: 12500, currency: "ZAR", status: "approved", risk: "low", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: "tx-base-3", account: "Capitec Business", beneficiary: "Payroll Run", amount: 286000, currency: "ZAR", status: "approved", risk: "low", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
];

// ============================================================
// Multi-stage scenario definitions
// ============================================================

function makeAlert(id: string, title: string, severity: string, message: string, extras: Record<string, any> = {}) {
  return {
    id,
    title,
    severity,
    message,
    timestamp: new Date().toISOString(),
    category: "attack",
    acknowledged: false,
    resolved: false,
    ...extras,
  };
}

function buildScenario(scenario: string): AttackStage[] {
  const now = Date.now();
  switch (scenario) {
    case "financial_theft":
      return [
        {
          at: 0,
          riskDelta: 25,
          alert: makeAlert("ft-1", "🔍 Recon: Account Lookup", "low",
            "Anonymous OSINT lookup detected on TymeBank profile from TOR exit node.",
            { user: "system", recommendedAction: "Increase IP rate limiting" }),
        },
        {
          at: 6000,
          riskDelta: 20,
          alert: makeAlert("ft-2", "⚠️ Beneficiary Added", "high",
            "New beneficiary 'KZ Holdings (UAE)' added to TymeBank by sarah.chen@company.co.za outside business hours.",
            { user: "sarah.chen@company.co.za", recommendedAction: "Verify with account owner via phone" }),
        },
        {
          at: 14000,
          riskDelta: 15,
          alert: makeAlert("ft-3", "🚨 Unauthorised Transfer Initiated", "critical",
            "R20,000 transfer to 'KZ Holdings (UAE)' pending approval. Pattern matches known mule account.",
            { user: "sarah.chen@company.co.za", recommendedAction: "Block transaction & freeze account" }),
        },
        {
          at: 22000,
          riskDelta: 10,
          alert: makeAlert("ft-4", "🛡️ FinanceShield Auto-Block", "high",
            "Transfer of R20,000 was held in escrow pending dual-approval. No funds left the account.",
            { recommendedAction: "Confirm block & rotate banking credentials" }),
        },
      ];
    case "impossible_travel":
      return [
        { at: 0, riskDelta: 18, alert: makeAlert("it-1", "🌍 Login: Cape Town", "low", "admin@company.co.za signed in from Cape Town, ZA on a known device.") },
        { at: 8000, riskDelta: 35, alert: makeAlert("it-2", "✈️ Login: Lagos, NG", "critical", "Same account signed in from Lagos, Nigeria 14 minutes later. Travel impossible.", { recommendedAction: "Force sign-out all sessions, require password reset" }) },
        { at: 16000, riskDelta: 12, alert: makeAlert("it-3", "🔓 OAuth Token Exfiltrated", "high", "Refresh token used to issue 3 new access tokens from Lagos IP.", { recommendedAction: "Revoke all OAuth grants" }) },
      ];
    case "brute_force":
      return [
        { at: 0, riskDelta: 10, alert: makeAlert("bf-1", "🔐 Failed Logins Spike", "medium", "12 failed sign-ins on finance@company.co.za in 60 seconds.") },
        { at: 7000, riskDelta: 15, alert: makeAlert("bf-2", "🔐 Brute Force Confirmed", "high", "47 failed attempts from 41.215.x.x (Nigeria). Account temporarily locked.", { recommendedAction: "Block source IP range" }) },
        { at: 14000, riskDelta: 10, alert: makeAlert("bf-3", "🛡️ Lockout Engaged", "medium", "Account locked for 30 min. Notify user via SMS.") },
      ];
    case "shadow_app":
      return [
        { at: 0, riskDelta: 15, alert: makeAlert("sa-1", "👁️ New OAuth Grant", "medium", "'Free Invoice Generator' requested mailbox.read scope from 5 users.") },
        { at: 8000, riskDelta: 25, alert: makeAlert("sa-2", "🚨 Mass Mailbox Access", "high", "App is now reading mailboxes at 200 ops/min — typical exfil pattern.", { recommendedAction: "Revoke app and reset affected mailboxes" }) },
      ];
    case "sim_swap":
      return [
        { at: 0, riskDelta: 20, alert: makeAlert("ss-1", "📱 Carrier Notice", "high", "Vodacom reports SIM change for CEO mobile 082-***-4521.") },
        { at: 7000, riskDelta: 30, alert: makeAlert("ss-2", "🚨 SMS 2FA Intercepted", "critical", "Banking OTP delivered to new SIM. Account takeover likely.", { recommendedAction: "Suspend banking 2FA & revert to authenticator app" }) },
        { at: 15000, riskDelta: 15, alert: makeAlert("ss-3", "💸 Banking Login from New Device", "critical", "TymeBank login from Android device in Sandton, fingerprint never seen.", { recommendedAction: "Freeze banking & contact carrier fraud" }) },
      ];
    case "phishing":
      return [
        { at: 0, riskDelta: 12, alert: makeAlert("ph-1", "📧 Suspicious Email Clicked", "low", "HR manager clicked link in mail spoofing 'Microsoft 365 Quarantine'.") },
        { at: 8000, riskDelta: 25, alert: makeAlert("ph-2", "🎣 Credentials Submitted", "critical", "M365 credentials posted to attacker domain login.microsft-secure.cn.", { recommendedAction: "Force password reset & revoke sessions" }) },
        { at: 16000, riskDelta: 15, alert: makeAlert("ph-3", "📤 Inbox Forwarding Rule Created", "high", "Hidden rule auto-forwards finance mail to attacker@protonmail.com.", { recommendedAction: "Delete forwarding rule" }) },
      ];
    default:
      return [];
  }
}

// ============================================================
// Tick: progress staged alerts based on elapsed time
// ============================================================

function tickAttack() {
  if (!systemState.isUnderAttack || !systemState.attackStartTime) return;
  const elapsed = Date.now() - systemState.attackStartTime;
  for (const stage of systemState.stages) {
    if (elapsed >= stage.at && !systemState.firedStageIds.has(stage.alert.id)) {
      systemState.firedStageIds.add(stage.alert.id);
      systemState.dynamicAlerts.unshift(stage.alert);
      // Side-effects per scenario
      if (systemState.scenario === "financial_theft" && stage.alert.id === "ft-3") {
        systemState.flaggedTransactions.unshift({
          id: "tx-attack-1",
          account: "TymeBank Business",
          beneficiary: "KZ Holdings (UAE)",
          amount: 20000,
          currency: "ZAR",
          status: "flagged",
          risk: "critical",
          timestamp: new Date().toISOString(),
          reason: "New beneficiary + after-hours + high-risk geography",
        });
        systemState.beneficiaryChanges.unshift({
          id: "bc-1",
          account: "TymeBank Business",
          oldBeneficiary: "SARS PAYE",
          newBeneficiary: "KZ Holdings (UAE)",
          changedBy: "sarah.chen@company.co.za",
          timestamp: new Date().toISOString(),
          status: "suspicious",
        });
      }
      if (systemState.scenario === "financial_theft" && stage.alert.id === "ft-4") {
        const tx = systemState.flaggedTransactions.find((t) => t.id === "tx-attack-1");
        if (tx) tx.status = "blocked";
      }
    }
  }
}

function currentRiskScore() {
  if (!systemState.isUnderAttack) {
    return 22 + Math.floor(Math.random() * 8);
  }
  // Sum risk deltas of fired stages over baseline
  let score = 30;
  for (const id of systemState.firedStageIds) {
    const stage = systemState.stages.find((s) => s.alert.id === id);
    if (stage?.riskDelta) score += stage.riskDelta;
  }
  return Math.min(99, score);
}

function gradeForScore(score: number): string {
  if (score < 30) return "A";
  if (score < 50) return "B";
  if (score < 70) return "C";
  if (score < 85) return "D";
  return "F";
}

function pushTrendPoint(score: number) {
  systemState.riskTrend.push({ t: new Date().toISOString(), score });
  if (systemState.riskTrend.length > 48) systemState.riskTrend.shift();
}

// ============================================================
// Aggregators
// ============================================================

function generateBaseMetrics() {
  tickAttack();
  const mfaUsers = users.filter((u) => u.mfaEnabled).length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const score = currentRiskScore();
  pushTrendPoint(score);

  const visibleAlerts = [...systemState.dynamicAlerts, ...baselineAlerts()].filter(
    (a) => !systemState.resolvedAlertIds.has(a.id)
  );
  const criticalCount = visibleAlerts.filter((a) => a.severity === "critical").length;
  const highCount = visibleAlerts.filter((a) => a.severity === "high").length;

  return {
    riskScore: score,
    grade: gradeForScore(score),
    activeAlerts: visibleAlerts.length,
    criticalAlerts: criticalCount,
    highAlerts: highCount,
    shadowApps: shadowApps.length,
    devicesSecure: `${Math.round((devices.filter((d) => d.compliant).length / devices.length) * 100)}%`,
    lastScan: new Date().toISOString(),
    isUnderAttack: systemState.isUnderAttack,
    threatType: systemState.threatType,
    scenario: systemState.scenario,
    attackElapsedMs: systemState.attackStartTime ? Date.now() - systemState.attackStartTime : 0,
    mfaPercentage: Math.round((mfaUsers / users.length) * 100),
    totalUsers: users.length,
    activeUsers,
    failedLogins: systemState.isUnderAttack ? 30 + systemState.firedStageIds.size * 8 : loginEvents.filter((e) => !e.success).length,
    inactiveAccounts: users.filter((u) => u.status !== "active").length,
    suspiciousLogins: loginEvents.filter((e: any) => e.suspicious).length,
    complianceScore: Math.round(complianceData.frameworks.reduce((acc, f) => acc + f.score, 0) / complianceData.frameworks.length),
    highRiskUsers: users.filter((u) => u.riskScore > 50).length,
    highlights: buildHighlights(visibleAlerts),
  };
}

function buildHighlights(alerts: any[]): { type: "info" | "warning" | "critical"; text: string }[] {
  const out: { type: "info" | "warning" | "critical"; text: string }[] = [];
  if (systemState.isUnderAttack) {
    out.push({ type: "critical", text: `${systemState.threatType} attack in progress — ${systemState.firedStageIds.size} stage(s) detected.` });
  }
  const noMfa = users.filter((u) => !u.mfaEnabled);
  if (noMfa.length > 0) out.push({ type: "warning", text: `${noMfa.length} user(s) still without MFA (${noMfa.map((u) => u.name).slice(0, 2).join(", ")}${noMfa.length > 2 ? "…" : ""}).` });
  const nonCompliantDevices = devices.filter((d) => !d.compliant);
  if (nonCompliantDevices.length > 0) out.push({ type: "warning", text: `${nonCompliantDevices.length} device(s) failing compliance checks.` });
  if (out.length === 0) out.push({ type: "info", text: "All systems healthy — no anomalies detected in the last hour." });
  return out;
}

function baselineAlerts() {
  return [
    {
      id: "alert-base-1",
      title: "Unusual Login Pattern",
      severity: "medium",
      message: "Multiple failed login attempts detected from new IP range",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      category: "authentication",
      user: "d.kim@company.co.za",
      recommendedAction: "Review login history & enforce MFA",
    },
    {
      id: "alert-base-2",
      title: "Shadow App Detected",
      severity: "low",
      message: "Unauthorized SaaS app connected to corporate account",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      category: "shadow_it",
      recommendedAction: "Review in Access & Shadow IT",
    },
  ];
}

function generateAlerts() {
  tickAttack();
  const all = [...systemState.dynamicAlerts, ...baselineAlerts()];
  return all
    .filter((a) => !systemState.resolvedAlertIds.has(a.id))
    .map((a) => ({
      ...a,
      acknowledged: systemState.acknowledgedAlertIds.has(a.id),
    }));
}

function generateFinanceData() {
  tickAttack();
  return {
    accounts: protectedAccounts,
    transactions: [...systemState.flaggedTransactions, ...baselineTransactions].slice(0, 12),
    beneficiaryChanges: systemState.beneficiaryChanges,
    blockedToday: systemState.flaggedTransactions.filter((t) => t.status === "blocked").length,
    flaggedToday: systemState.flaggedTransactions.filter((t) => t.status === "flagged").length,
    isUnderAttack: systemState.isUnderAttack,
    threatType: systemState.threatType,
  };
}

function handleSimulation(scenario: string) {
  const stages = buildScenario(scenario);
  if (stages.length === 0) return { success: false, message: `Unknown scenario: ${scenario}` };
  systemState.isUnderAttack = true;
  systemState.scenario = scenario;
  systemState.threatType = scenario.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  systemState.attackStartTime = Date.now();
  systemState.stages = stages;
  systemState.firedStageIds = new Set();
  systemState.dynamicAlerts = [];
  systemState.resolvedAlertIds = new Set();
  systemState.acknowledgedAlertIds = new Set();
  systemState.flaggedTransactions = [];
  systemState.beneficiaryChanges = [];
  console.log(`Simulation started: ${scenario}`);
  return { success: true, message: `Simulation "${scenario}" triggered`, stages: stages.length };
}

function handleReset() {
  systemState.isUnderAttack = false;
  systemState.threatType = null;
  systemState.scenario = null;
  systemState.attackStartTime = null;
  systemState.stages = [];
  systemState.firedStageIds = new Set();
  systemState.dynamicAlerts = [];
  systemState.resolvedAlertIds = new Set();
  systemState.acknowledgedAlertIds = new Set();
  systemState.flaggedTransactions = [];
  systemState.beneficiaryChanges = [];
  console.log("System reset");
  return { success: true, message: "System reset to baseline" };
}

// ============================================================
// HTTP handler
// ============================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/dashboard';
    console.log(`Request: ${req.method} ${path}`);

    const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    if (path === '/dashboard') return json(generateBaseMetrics());
    if (path === '/alerts') return json(generateAlerts());
    if (path === '/risk-trend') return json({ trend: systemState.riskTrend });
    if (path === '/finance') return json(generateFinanceData());

    if (path === '/users') {
      return json(users.map((u) => ({
        ...u,
        deviceCount: devices.filter((d) => d.userId === u.id).length,
      })));
    }

    if (path === '/devices') {
      return json(devices.map((d) => ({
        ...d,
        userName: users.find((u) => u.id === d.userId)?.name || "Unknown",
      })));
    }

    if (path === '/shadow-apps') return json(shadowApps);

    if (path === '/login-events') {
      return json(loginEvents.map((e) => ({
        ...e,
        userName: users.find((u) => u.id === e.userId)?.name || "Unknown",
      })));
    }

    if (path === '/compliance') return json(complianceData);
    if (path === '/geo-threats') return json(geoThreats);

    if (path === '/alerts/acknowledge') {
      const id = body.id;
      if (!id || typeof id !== 'string') return json({ error: 'id required' }, 400);
      systemState.acknowledgedAlertIds.add(id);
      return json({ success: true });
    }

    if (path === '/alerts/resolve') {
      const id = body.id;
      if (!id || typeof id !== 'string') return json({ error: 'id required' }, 400);
      systemState.resolvedAlertIds.add(id);
      // If all critical/high resolved, end attack state
      const remaining = generateAlerts().filter((a) => a.severity === 'critical' || a.severity === 'high');
      if (remaining.length === 0) {
        systemState.isUnderAttack = false;
        systemState.threatType = null;
      }
      return json({ success: true });
    }

    if (path === '/simulate') return json(handleSimulation(body.scenario || 'unknown'));
    if (path === '/reset') return json(handleReset());

    return json({
      error: 'Not found',
      availableRoutes: [
        '/dashboard', '/alerts', '/alerts/acknowledge', '/alerts/resolve',
        '/risk-trend', '/finance', '/users', '/devices', '/shadow-apps',
        '/login-events', '/compliance', '/geo-threats', '/simulate', '/reset',
      ],
    }, 404);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
