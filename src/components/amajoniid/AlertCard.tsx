import { AlertTriangle, Info, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  user: string;
  timestamp: string;
  message: string;
}

interface AlertCardProps {
  alert: Alert;
  onResolve?: () => void;
}

export function AlertCard({ alert, onResolve }: AlertCardProps) {
  const severityConfig = {
    low: {
      border: "border-l-status-info",
      bg: "bg-status-info/5",
      icon: Info,
      iconColor: "text-status-info",
    },
    medium: {
      border: "border-l-status-warning",
      bg: "bg-status-warning/5",
      icon: AlertTriangle,
      iconColor: "text-status-warning",
    },
    high: {
      border: "border-l-status-danger",
      bg: "bg-status-danger/5",
      icon: AlertCircle,
      iconColor: "text-status-danger",
    },
    critical: {
      border: "border-l-status-danger",
      bg: "bg-status-danger/10",
      icon: XCircle,
      iconColor: "text-status-danger",
    },
  };

  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border border-border ${config.bg} border-l-4 ${config.border} ${
      alert.severity === "critical" ? "animate-pulse" : ""
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-card ${config.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{alert.type}</h3>
            <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Affected: {alert.user}</p>
          <p className="text-sm text-foreground mt-2">{alert.message}</p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="text-xs">
              Investigate
            </Button>
            {onResolve && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-status-safe"
                onClick={onResolve}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
          alert.severity === "critical" || alert.severity === "high" 
            ? "bg-status-danger/20 text-status-danger" 
            : alert.severity === "medium" 
              ? "bg-status-warning/20 text-status-warning"
              : "bg-status-info/20 text-status-info"
        }`}>
          {alert.severity}
        </span>
      </div>
    </div>
  );
}
