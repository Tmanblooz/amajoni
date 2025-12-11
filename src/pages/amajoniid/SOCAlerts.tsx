import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AlertCard } from "@/components/amajoniid/AlertCard";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  user: string;
  timestamp: string;
  message: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "Impossible Travel",
    severity: "critical",
    user: "john.doe@company.co.za",
    timestamp: "2 min ago",
    message: "Login detected from Johannesburg and Lagos within 30 minutes.",
  },
  {
    id: "2",
    type: "Failed Login Attempts",
    severity: "high",
    user: "admin@company.co.za",
    timestamp: "15 min ago",
    message: "5 failed login attempts from unknown IP address.",
  },
  {
    id: "3",
    type: "New Device Login",
    severity: "medium",
    user: "sarah.smith@company.co.za",
    timestamp: "1 hour ago",
    message: "First login from iPhone 15 Pro - Cape Town.",
  },
  {
    id: "4",
    type: "MFA Disabled",
    severity: "high",
    user: "finance@company.co.za",
    timestamp: "2 hours ago",
    message: "Multi-factor authentication was disabled for this account.",
  },
];

async function fetchAlerts(): Promise<Alert[]> {
  try {
    const response = await fetch("http://localhost:8000/api/v1/alerts");
    if (!response.ok) throw new Error("API unavailable");
    return response.json();
  } catch {
    return mockAlerts;
  }
}

export default function SOCAlerts() {
  const { data: alerts = mockAlerts, dataUpdatedAt } = useQuery({
    queryKey: ["soc-alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Show toast when new alerts come in
  useEffect(() => {
    if (alerts.length > 0 && alerts[0].severity === "critical") {
      toast.error(`🚨 Critical Alert: ${alerts[0].type}`, {
        description: alerts[0].message,
      });
    }
  }, [dataUpdatedAt]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-status-danger/10">
            <AlertTriangle className="h-6 w-6 text-status-danger" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">SOC Alerts</h1>
            <p className="text-muted-foreground">Real-time security event feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Auto-refreshing every 2s</span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Active Alerts</h3>
          <p className="text-muted-foreground mt-1">Your systems are operating normally.</p>
        </div>
      )}
    </div>
  );
}
