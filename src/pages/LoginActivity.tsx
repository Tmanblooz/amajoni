import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, Globe, MapPin, Monitor, RefreshCw, Search, Shield, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

type SignInLog = {
  id: string;
  email: string;
  provider: string;
  sign_in_time: string;
  ip_address: string | null;
  location_city: string | null;
  location_country: string | null;
  device_info: Record<string, unknown> | null;
  is_suspicious: boolean;
  risk_level: string;
  risk_factors: string[];
  status: string;
};

type IdentityAlert = {
  id: string;
  email: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  recommended_action: string | null;
  status: string;
  created_at: string;
};

const riskLevelColors: Record<string, string> = {
  low: "bg-status-healthy/10 text-status-healthy border-status-healthy/20",
  medium: "bg-status-warning/10 text-status-warning border-status-warning/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-status-critical/10 text-status-critical border-status-critical/20",
};

const statusColors: Record<string, string> = {
  success: "bg-status-healthy/10 text-status-healthy",
  failure: "bg-status-critical/10 text-status-critical",
  blocked: "bg-muted text-muted-foreground",
};

const alertStatusColors: Record<string, string> = {
  open: "bg-status-critical/10 text-status-critical",
  investigating: "bg-status-warning/10 text-status-warning",
  resolved: "bg-status-healthy/10 text-status-healthy",
  dismissed: "bg-muted text-muted-foreground",
};

export default function LoginActivity() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch sign-in logs
  const { data: signInLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["sign-in-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sign_in_logs")
        .select("*")
        .order("sign_in_time", { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data as SignInLog[];
    },
  });

  // Fetch identity alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["identity-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("identity_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as IdentityAlert[];
    },
  });

  // Real-time subscription for alerts
  useEffect(() => {
    const channel = supabase
      .channel("identity-alerts-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "identity_alerts" },
        (payload) => {
          toast.warning("New security alert", {
            description: (payload.new as IdentityAlert).title,
          });
          queryClient.invalidateQueries({ queryKey: ["identity-alerts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Sync sign-in logs
  const handleSync = async (provider: string) => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to sync");
        return;
      }

      const { data, error } = await supabase.functions.invoke("sync-sign-in-logs", {
        body: { provider },
      });

      if (error) throw error;
      
      toast.success(`Synced ${data.synced} sign-in events`, {
        description: data.suspicious > 0 ? `${data.suspicious} suspicious activities detected` : undefined,
      });
      
      queryClient.invalidateQueries({ queryKey: ["sign-in-logs"] });
      queryClient.invalidateQueries({ queryKey: ["identity-alerts"] });
    } catch (error) {
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Update alert status
  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("identity_alerts")
        .update({ 
          status,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", alertId);

      if (error) throw error;
      
      toast.success("Alert updated");
      queryClient.invalidateQueries({ queryKey: ["identity-alerts"] });
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  // Filter logs
  const filteredLogs = signInLogs?.filter((log) => {
    const matchesSearch = log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location_country?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = riskFilter === "all" || 
      (riskFilter === "suspicious" && log.is_suspicious) ||
      log.risk_level === riskFilter;
    
    return matchesSearch && matchesRisk;
  });

  // Stats
  const stats = {
    totalLogins: signInLogs?.length || 0,
    suspiciousLogins: signInLogs?.filter(l => l.is_suspicious).length || 0,
    failedLogins: signInLogs?.filter(l => l.status === "failure").length || 0,
    openAlerts: alerts?.filter(a => a.status === "open").length || 0,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Login Activity</h1>
          <p className="text-muted-foreground">
            Monitor sign-in events and detect suspicious identity activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSync("microsoft")}
            disabled={syncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Microsoft
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSync("google")}
            disabled={syncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Google
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{stats.suspiciousLogins}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-status-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-critical">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Blocked or denied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
            <Shield className="h-4 w-4 text-status-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-critical">{stats.openAlerts}</div>
            <p className="text-xs text-muted-foreground">Pending action</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Sign-in Logs</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {stats.openAlerts > 0 && (
              <span className="ml-2 bg-status-critical text-white text-xs px-1.5 py-0.5 rounded-full">
                {stats.openAlerts}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, IP, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logins</SelectItem>
                <SelectItem value="suspicious">Suspicious Only</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs && filteredLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className={log.is_suspicious ? "bg-status-critical/5" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {log.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{log.email}</div>
                              <div className="text-xs text-muted-foreground capitalize">{log.provider}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span title={format(new Date(log.sign_in_time), "PPpp")}>
                              {formatDistanceToNow(new Date(log.sign_in_time), { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.location_country ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>
                                {log.location_city && `${log.location_city}, `}
                                {log.location_country}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {log.ip_address || "N/A"}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[log.status]}>
                            {log.status === "success" ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={riskLevelColors[log.risk_level]}>
                              {log.risk_level}
                            </Badge>
                            {log.risk_factors.length > 0 && (
                              <span className="text-xs text-muted-foreground" title={log.risk_factors.join(", ")}>
                                {log.risk_factors.length} risk factor{log.risk_factors.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Monitor className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No sign-in logs yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mt-1">
                    Connect Microsoft or Google and sync to see login activity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alertsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={alert.status === "open" ? "border-status-critical/50" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={riskLevelColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className={alertStatusColors[alert.status]}>
                          {alert.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{alert.title}</CardTitle>
                    <CardDescription>{alert.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {alert.description && (
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    )}
                    {alert.recommended_action && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium">Recommended Action</p>
                        <p className="text-sm text-muted-foreground">{alert.recommended_action}</p>
                      </div>
                    )}
                    {alert.status === "open" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAlertStatus(alert.id, "investigating")}
                        >
                          Investigate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAlertStatus(alert.id, "resolved")}
                        >
                          Mark Resolved
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateAlertStatus(alert.id, "dismissed")}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-12 w-12 text-status-healthy/50 mb-4" />
                <h3 className="text-lg font-semibold">No alerts</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-1">
                  All clear! No suspicious activity has been detected.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}