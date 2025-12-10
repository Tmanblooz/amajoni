import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, Users, AlertTriangle, Activity, TrendingUp, 
  RefreshCw, ChevronRight, Loader2 
} from "lucide-react";
import { useDashboardSummary, useAlerts } from "@/hooks/useMockApi";
import { OverallRiskGrade } from "@/components/identity/RiskScoreBadge";
import { MFAComplianceGauge } from "@/components/identity/MFAStatusIndicator";
import { AlertCardCompact } from "@/components/identity/AlertCard";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart 
} from "recharts";

export default function IdentityDashboard() {
  const navigate = useNavigate();
  const { data: summary, loading: summaryLoading, refetch } = useDashboardSummary();
  const { data: alerts, loading: alertsLoading } = useAlerts();

  const topAlerts = alerts?.filter(a => a.status === 'open')
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 3);

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identity Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor identity risks across your organization
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Overall Risk Grade */}
        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Security Grade
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <OverallRiskGrade grade={summary.overallGrade} score={summary.overallScore} />
          </CardContent>
        </Card>

        {/* Suspicious Logins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-warning">
              {summary.suspiciousLoginsThisWeek}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Shield className="h-4 w-4 text-status-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-critical">
              {summary.activeAlerts}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Monitored accounts</p>
          </CardContent>
        </Card>

        {/* MFA Compliance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MFA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <MFAComplianceGauge percentage={summary.mfaCompliancePercentage} />
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Login Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Login Activity Trend</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.loginTrend}>
                  <defs>
                    <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="suspiciousGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--status-critical))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--status-critical))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en', { weekday: 'short' })}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="logins" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#loginGradient)"
                    strokeWidth={2}
                    name="Total Logins"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="suspicious" 
                    stroke="hsl(var(--status-critical))" 
                    fill="url(#suspiciousGradient)"
                    strokeWidth={2}
                    name="Suspicious"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Alerts</CardTitle>
                <CardDescription>Highest severity issues</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/identity/alerts')}
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : topAlerts && topAlerts.length > 0 ? (
              topAlerts.map((alert) => (
                <AlertCardCompact key={alert.id} alert={alert} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common security tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/identity/users')}
          >
            <Users className="h-6 w-6" />
            <span>View Users</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/identity/events')}
          >
            <Activity className="h-6 w-6" />
            <span>Login Events</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/identity/alerts')}
          >
            <AlertTriangle className="h-6 w-6" />
            <span>View Alerts</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/identity/recommendations')}
          >
            <TrendingUp className="h-6 w-6" />
            <span>Recommendations</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
