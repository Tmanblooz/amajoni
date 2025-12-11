import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Eye, Monitor, Clock } from "lucide-react";
import { RiskGauge } from "@/components/amajoniid/RiskGauge";
import { KPICard } from "@/components/amajoniid/KPICard";

interface RiskData {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  activeAlerts: number;
  shadowApps: number;
  devicesMonitored: number;
  lastScan: string;
}

const defaultData: RiskData = {
  score: 92,
  grade: "A",
  activeAlerts: 0,
  shadowApps: 2,
  devicesMonitored: 12,
  lastScan: "2 min ago",
};

async function fetchRiskScore(): Promise<RiskData> {
  try {
    const response = await fetch("http://localhost:8000/api/v1/risk-score");
    if (!response.ok) throw new Error("API unavailable");
    return response.json();
  } catch {
    return defaultData;
  }
}

export default function Dashboard() {
  const { data = defaultData } = useQuery({
    queryKey: ["risk-score"],
    queryFn: fetchRiskScore,
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time identity risk monitoring</p>
      </div>

      {/* Hero - Risk Gauge */}
      <div className="flex justify-center">
        <RiskGauge score={data.score} grade={data.grade} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Alerts"
          value={data.activeAlerts}
          icon={AlertTriangle}
          variant={data.activeAlerts > 0 ? "danger" : "safe"}
        />
        <KPICard
          title="Shadow Apps"
          value={data.shadowApps}
          icon={Eye}
          variant={data.shadowApps > 2 ? "warning" : "default"}
        />
        <KPICard
          title="Devices Monitored"
          value={data.devicesMonitored}
          icon={Monitor}
          variant="default"
        />
        <KPICard
          title="Last Scan"
          value={data.lastScan}
          icon={Clock}
          variant="safe"
        />
      </div>
    </div>
  );
}
