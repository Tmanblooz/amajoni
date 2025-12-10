import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Activity, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useLoginEvents } from "@/hooks/useMockApi";
import { LoginTimeline } from "@/components/identity/LoginTimeline";

export default function IdentityEvents() {
  const { data: events, loading } = useLoginEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading login events...</p>
        </div>
      </div>
    );
  }

  if (!events) return null;

  // Calculate stats
  const stats = {
    total: events.length,
    success: events.filter(e => e.result === 'success').length,
    failed: events.filter(e => e.result === 'failed').length,
    suspicious: events.filter(e => e.riskFlag === 'suspicious').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Login Events</h1>
        <p className="text-muted-foreground">
          Monitor login activity and detect suspicious behavior
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-healthy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-healthy">{stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-status-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-critical">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{stats.suspicious}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Login Timeline</CardTitle>
          <CardDescription>
            Filter by user, location, result, and risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginTimeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
