import { AlertCard } from "@/components/amajoniid/AlertCard";
import { useAmajoni } from "@/contexts/AmajoniContext";
import { useAlertsData } from "@/hooks/useAmajoniApi";
import { ShieldCheck, AlertTriangle, RefreshCw, Loader2, WifiOff } from "lucide-react";

export default function SOCAlerts() {
  const { resolveAlert, isUnderAttack } = useAmajoni();
  const { data: apiAlerts, loading, error } = useAlertsData(2000);
  const contextAlerts = useAmajoni().alerts;
  
  // Use API alerts if available, otherwise fall back to context
  const alerts = apiAlerts ?? contextAlerts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SOC Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Security Operations Center - Real-time threat monitoring
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {loading && !apiAlerts ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : error ? (
            <>
              <WifiOff className="h-4 w-4 text-status-warning" />
              <span className="text-status-warning">Offline mode</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '2s' }} />
              <span>Live updates</span>
            </>
          )}
        </div>
      </div>

      {isUnderAttack && (
        <div className="bg-status-danger/10 border border-status-danger/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
          <AlertTriangle className="h-6 w-6 text-status-danger" />
          <div>
            <p className="font-semibold text-status-danger">Active Threat Detected</p>
            <p className="text-sm text-muted-foreground">
              Review critical alerts below and take immediate action
            </p>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ShieldCheck className="h-16 w-16 text-status-safe mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">All Clear</h2>
          <p className="text-muted-foreground mt-2">
            No active security alerts. Your systems are protected.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={{
                id: alert.id,
                type: alert.title,
                severity: alert.severity,
                user: "system@company.co.za",
                timestamp: alert.timestamp.toLocaleTimeString(),
                message: alert.message,
              }}
              onResolve={() => resolveAlert(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
