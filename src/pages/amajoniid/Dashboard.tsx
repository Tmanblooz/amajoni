import { RiskGauge } from "@/components/amajoniid/RiskGauge";
import { KPICard } from "@/components/amajoniid/KPICard";
import { StatCard } from "@/components/amajoniid/StatCard";
import { TrendChart } from "@/components/amajoniid/TrendChart";
import { ThreatMap } from "@/components/amajoniid/ThreatMap";
import { useAmajoni } from "@/contexts/AmajoniContext";
import { 
  AlertTriangle, Eye, Monitor, Clock, User, Smartphone, 
  Shield, Users, Key, Lock, TrendingUp, Activity,
  CheckCircle, XCircle, UserX
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { riskScore, grade, activeAlerts, shadowApps, devicesSecure, lastScan, isUnderAttack, alerts } = useAmajoni();
  const navigate = useNavigate();

  const recentActivity = [
    { icon: User, text: "User ken@company.co.za logged in from Johannesburg", time: "5 min ago" },
    { icon: Smartphone, text: "New device detected: iPhone 15 Pro", time: "1 hour ago" },
    { icon: User, text: "Admin user changed password successfully", time: "2 hours ago" },
    { icon: CheckCircle, text: "MFA enabled for finance@company.co.za", time: "3 hours ago" },
  ];

  // Mock trend data
  const loginTrend = [12, 15, 14, 18, 16, 22, 19];
  const alertTrend = isUnderAttack ? [2, 1, 3, 2, 4, 6, activeAlerts] : [2, 1, 3, 2, 2, 1, activeAlerts];
  const failedLoginTrend = isUnderAttack ? [1, 0, 2, 1, 3, 8, 12] : [1, 0, 2, 1, 0, 1, 0];

  const weeklyLoginData = [
    { name: "Mon", value: 45 },
    { name: "Tue", value: 52 },
    { name: "Wed", value: 49 },
    { name: "Thu", value: 63 },
    { name: "Fri", value: 58 },
    { name: "Sat", value: 15 },
    { name: "Sun", value: 12 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {isUnderAttack 
            ? "⚠️ Active threat detected - immediate action required"
            : "Real-time identity and access monitoring"
          }
        </p>
      </div>

      {/* Hero Risk Gauge */}
      <div className="flex justify-center">
        <RiskGauge score={riskScore} grade={grade} />
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Alerts"
          value={activeAlerts}
          icon={AlertTriangle}
          variant={activeAlerts > 2 ? "danger" : activeAlerts > 0 ? "warning" : "default"}
        />
        <KPICard
          title="Shadow Apps"
          value={shadowApps}
          icon={Eye}
          variant={shadowApps > 5 ? "warning" : "default"}
        />
        <KPICard
          title="Devices Secure"
          value={devicesSecure}
          icon={Monitor}
          variant="safe"
        />
        <KPICard
          title="Last Scan"
          value={lastScan}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Secondary Stats with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="24"
          subtitle="5 admins, 19 standard"
          icon={Users}
          trend={[20, 21, 22, 22, 23, 24, 24]}
          trendColor="accent"
          onClick={() => {}}
        />
        <StatCard
          title="MFA Enabled"
          value="87%"
          subtitle="21 of 24 users"
          icon={Key}
          trend={[75, 78, 80, 83, 85, 86, 87]}
          trendColor="safe"
          variant="safe"
        />
        <StatCard
          title="Failed Logins"
          value={isUnderAttack ? "47" : "3"}
          subtitle="Last 24 hours"
          icon={XCircle}
          trend={failedLoginTrend}
          trendColor={isUnderAttack ? "danger" : "warning"}
          variant={isUnderAttack ? "danger" : "default"}
        />
        <StatCard
          title="Inactive Accounts"
          value="2"
          subtitle="30+ days dormant"
          icon={UserX}
          trend={[4, 3, 3, 2, 2, 2, 2]}
          trendColor="warning"
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Login Activity</h3>
            </div>
            <span className="text-xs text-muted-foreground">This week</span>
          </div>
          <TrendChart data={weeklyLoginData} color="accent" height={160} />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total: 294 logins</span>
            <span className="text-status-safe flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> +12% from last week
            </span>
          </div>
        </div>

        {/* Threat Map */}
        <ThreatMap />
      </div>

      {/* Security Posture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-status-safe/10">
              <Shield className="h-5 w-5 text-status-safe" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Identity Protection</h4>
              <p className="text-xs text-muted-foreground">Authentication status</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">MFA Coverage</span>
              <span className="text-status-safe font-medium">87%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-status-safe rounded-full" style={{ width: "87%" }} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isUnderAttack ? "bg-status-danger/10" : "bg-status-safe/10"}`}>
              <Lock className={`h-5 w-5 ${isUnderAttack ? "text-status-danger" : "text-status-safe"}`} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Access Control</h4>
              <p className="text-xs text-muted-foreground">Permission hygiene</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Least Privilege</span>
              <span className={`font-medium ${isUnderAttack ? "text-status-danger" : "text-status-safe"}`}>
                {isUnderAttack ? "65%" : "92%"}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isUnderAttack ? "bg-status-danger" : "bg-status-safe"}`} 
                style={{ width: isUnderAttack ? "65%" : "92%" }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${shadowApps > 3 ? "bg-status-warning/10" : "bg-status-safe/10"}`}>
              <Eye className={`h-5 w-5 ${shadowApps > 3 ? "text-status-warning" : "text-status-safe"}`} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Shadow IT</h4>
              <p className="text-xs text-muted-foreground">Unauthorized apps</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Apps Reviewed</span>
              <span className={`font-medium ${shadowApps > 3 ? "text-status-warning" : "text-status-safe"}`}>
                {Math.max(0, 8 - shadowApps)}/8
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${shadowApps > 3 ? "bg-status-warning" : "bg-status-safe"}`} 
                style={{ width: `${Math.max(0, (8 - shadowApps) / 8 * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 text-sm">
              <div className="p-2 rounded-lg bg-secondary">
                <activity.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-foreground">{activity.text}</p>
              </div>
              <span className="text-muted-foreground text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
