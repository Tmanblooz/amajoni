import { RiskGauge } from "@/components/amajoniid/RiskGauge";
import { KPICard } from "@/components/amajoniid/KPICard";
import { StatCard } from "@/components/amajoniid/StatCard";
import { TrendChart } from "@/components/amajoniid/TrendChart";
import { ThreatMap } from "@/components/amajoniid/ThreatMap";
import { SecurityPostureCards } from "@/components/amajoniid/SecurityPostureCards";
import { RecentActivityFeed } from "@/components/amajoniid/RecentActivityFeed";
import { QuickActions } from "@/components/amajoniid/QuickActions";
import { DashboardHeader } from "@/components/amajoniid/DashboardHeader";
import { ExecutiveSummary } from "@/components/amajoniid/ExecutiveSummary";
import { RiskTrendChart } from "@/components/amajoniid/RiskTrendChart";
import { AttackTimeline } from "@/components/amajoniid/AttackTimeline";
import { useAmajoni } from "@/contexts/AmajoniContext";
import { useDashboardData, useAlertsData, useRiskTrend } from "@/hooks/useAmajoniApi";
import { motion } from "framer-motion";
import {
  AlertTriangle, Eye, Monitor, Clock,
  Users, Key, XCircle, UserX,
  TrendingUp, Activity,
} from "lucide-react";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function Dashboard() {
  const { data: apiData, loading, error } = useDashboardData(2000);
  const { data: alertsData } = useAlertsData(2000);
  const { data: trendData } = useRiskTrend(4000);
  const ctx = useAmajoni();

  const riskScore = apiData?.riskScore ?? ctx.riskScore;
  const grade = (apiData?.grade as "A" | "B" | "C" | "D" | "F") ?? ctx.grade;
  const activeAlerts = apiData?.activeAlerts ?? ctx.activeAlerts;
  const shadowApps = apiData?.shadowApps ?? ctx.shadowApps;
  const devicesSecure = apiData?.devicesSecure ?? ctx.devicesSecure;
  const lastScan = apiData?.lastScan ?? ctx.lastScan;
  const isUnderAttack = apiData?.isUnderAttack ?? ctx.isUnderAttack;
  const mfaPercentage = apiData?.mfaPercentage ?? 87;
  const totalUsers = apiData?.totalUsers ?? 24;
  const failedLogins = apiData?.failedLogins ?? (isUnderAttack ? 47 : 3);
  const inactiveAccounts = apiData?.inactiveAccounts ?? 2;
  const criticalAlerts = apiData?.criticalAlerts ?? 0;
  const highAlerts = apiData?.highAlerts ?? 0;
  const highlights = apiData?.highlights ?? [{ type: "info" as const, text: "Connecting to backend…" }];

  const failedLoginTrend = isUnderAttack ? [1, 0, 2, 1, 3, 8, 12] : [1, 0, 2, 1, 0, 1, 0];
  const weeklyLoginData = [
    { name: "Mon", value: 45 }, { name: "Tue", value: 52 }, { name: "Wed", value: 49 },
    { name: "Thu", value: 63 }, { name: "Fri", value: 58 }, { name: "Sat", value: 15 }, { name: "Sun", value: 12 },
  ];

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <DashboardHeader isUnderAttack={isUnderAttack} loading={loading} hasApiData={!!apiData} error={error} />
      </motion.div>

      {/* Risk Gauge + Executive Summary side-by-side */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex justify-center items-center">
          <RiskGauge score={riskScore} grade={grade} />
        </div>
        <div className="lg:col-span-2">
          <ExecutiveSummary
            riskScore={riskScore}
            grade={grade}
            isUnderAttack={isUnderAttack}
            threatType={apiData?.threatType}
            criticalAlerts={criticalAlerts}
            highAlerts={highAlerts}
            mfaPercentage={mfaPercentage}
            highlights={highlights}
          />
        </div>
      </motion.div>

      {/* Attack timeline appears only during incidents */}
      {isUnderAttack && alertsData && (
        <motion.div variants={fadeUp}>
          <AttackTimeline
            alerts={alertsData}
            threatType={apiData?.threatType}
            attackElapsedMs={apiData?.attackElapsedMs ?? 0}
          />
        </motion.div>
      )}

      {/* Primary KPIs */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Alerts" value={activeAlerts} icon={AlertTriangle}
          variant={activeAlerts > 2 ? "danger" : activeAlerts > 0 ? "warning" : "default"} />
        <KPICard title="Shadow Apps" value={shadowApps} icon={Eye}
          variant={shadowApps > 5 ? "warning" : "default"} />
        <KPICard title="Devices Secure" value={devicesSecure} icon={Monitor} variant="safe" />
        <KPICard title="Last Scan" value={typeof lastScan === "string" && lastScan.includes("T") ? new Date(lastScan).toLocaleTimeString() : lastScan} icon={Clock} variant="default" />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={String(totalUsers)} subtitle="5 admins, 19 standard" icon={Users}
          trend={[20, 21, 22, 22, 23, 24, totalUsers]} trendColor="accent" onClick={() => {}} />
        <StatCard title="MFA Enabled" value={`${mfaPercentage}%`}
          subtitle={`${Math.round(totalUsers * mfaPercentage / 100)} of ${totalUsers} users`}
          icon={Key} trend={[75, 78, 80, 83, 85, 86, mfaPercentage]} trendColor="safe" variant="safe" />
        <StatCard title="Failed Logins" value={String(failedLogins)} subtitle="Last 24 hours"
          icon={XCircle} trend={failedLoginTrend}
          trendColor={isUnderAttack ? "danger" : "warning"}
          variant={isUnderAttack ? "danger" : "default"} />
        <StatCard title="Inactive Accounts" value={String(inactiveAccounts)} subtitle="30+ days dormant"
          icon={UserX} trend={[4, 3, 3, 2, 2, 2, 2]} trendColor="warning" variant="warning" />
      </motion.div>

      {/* Risk Trend + Login Activity */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskTrendChart data={trendData ?? []} currentScore={riskScore} />
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
      </motion.div>

      {/* Threat Map */}
      <motion.div variants={fadeUp}>
        <ThreatMap />
      </motion.div>

      {/* Security Posture */}
      <motion.div variants={fadeUp}>
        <SecurityPostureCards
          isUnderAttack={isUnderAttack}
          shadowApps={shadowApps}
          mfaPercentage={mfaPercentage}
        />
      </motion.div>

      {/* Activity + Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityFeed />
        </div>
        <QuickActions />
      </motion.div>
    </motion.div>
  );
}
