import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, AlertTriangle, Search, CheckCircle } from "lucide-react";
import { useAlerts } from "@/hooks/useMockApi";
import { AlertCard } from "@/components/identity/AlertCard";
import { toast } from "sonner";

export default function IdentityAlerts() {
  const { data: alerts, loading, updateAlertStatus } = useAlerts();

  const handleAction = (alert: any) => {
    toast.success(`Action triggered for ${alert.type}`, {
      description: alert.recommendedAction,
    });
  };

  const handleStatusChange = (alertId: string, status: any) => {
    updateAlertStatus(alertId, status);
    toast.success(`Alert status updated to ${status}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (!alerts) return null;

  const openAlerts = alerts.filter(a => a.status === 'open');
  const investigatingAlerts = alerts.filter(a => a.status === 'investigating');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
        <p className="text-muted-foreground">
          Review and respond to identity security alerts
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-critical">{openAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Search className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{investigatingAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Currently being reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-healthy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-healthy">{resolvedAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
          <CardDescription>
            Manage and respond to security alerts by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="space-y-4">
            <TabsList>
              <TabsTrigger value="open" className="relative">
                Open
                {openAlerts.length > 0 && (
                  <span className="ml-2 bg-status-critical text-white text-xs px-1.5 py-0.5 rounded-full">
                    {openAlerts.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="investigating">
                Investigating
                {investigatingAlerts.length > 0 && (
                  <span className="ml-2 bg-status-warning text-white text-xs px-1.5 py-0.5 rounded-full">
                    {investigatingAlerts.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {openAlerts.length > 0 ? (
                openAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onAction={handleAction}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No open alerts</p>
                  <p className="text-sm">All security issues have been addressed</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="investigating" className="space-y-4">
              {investigatingAlerts.length > 0 ? (
                investigatingAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onAction={handleAction}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No alerts under investigation</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedAlerts.length > 0 ? (
                resolvedAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onAction={handleAction}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No resolved alerts yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
