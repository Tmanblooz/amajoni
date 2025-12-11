import { RiskGauge } from "@/components/amajoniid/RiskGauge";
import { KPICard } from "@/components/amajoniid/KPICard";
import { useAmajoni } from "@/contexts/AmajoniContext";
import { AlertTriangle, Eye, Monitor, Clock, User, Smartphone } from "lucide-react";

export default function Dashboard() {
  const { riskScore, grade, activeAlerts, shadowApps, devicesSecure, lastScan, isUnderAttack } = useAmajoni();

  const recentActivity = [
    { icon: User, text: "User ken@company.co.za logged in from Johannesburg", time: "5 min ago" },
    { icon: Smartphone, text: "New device detected: iPhone 15 Pro", time: "1 hour ago" },
    { icon: User, text: "Admin user changed password successfully", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-8">
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

      {/* KPI Grid */}
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
