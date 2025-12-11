import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
}

interface AmajoniState {
  isUnderAttack: boolean;
  riskScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  alerts: Alert[];
  activeAlerts: number;
  shadowApps: number;
  devicesSecure: number;
  lastScan: string;
}

interface AmajoniContextType extends AmajoniState {
  simulateTheft: () => void;
  resetSystem: () => void;
  resolveAlert: (id: string) => void;
}

const defaultState: AmajoniState = {
  isUnderAttack: false,
  riskScore: 87,
  grade: "A",
  alerts: [
    {
      id: "1",
      title: "New Device Login",
      message: "User ken@company.co.za logged in from a new device in Johannesburg",
      severity: "low",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      title: "OAuth App Connected",
      message: "Microsoft Teams was granted access by admin@company.co.za",
      severity: "low",
      timestamp: new Date(Date.now() - 7200000),
    },
  ],
  activeAlerts: 2,
  shadowApps: 3,
  devicesSecure: 12,
  lastScan: "2 min ago",
};

const AmajoniContext = createContext<AmajoniContextType | undefined>(undefined);

export function AmajoniProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AmajoniState>(defaultState);

  const simulateTheft = useCallback(() => {
    const criticalAlert: Alert = {
      id: `theft-${Date.now()}`,
      title: "🚨 CRITICAL: Unauthorized Transaction",
      message: "R20,000 outflow detected on TymeBank. Immediate action required!",
      severity: "critical",
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      isUnderAttack: true,
      riskScore: 28,
      grade: "F",
      alerts: [criticalAlert, ...prev.alerts],
      activeAlerts: prev.activeAlerts + 1,
    }));

    toast.error("🚨 THREAT DETECTED: R20,000 unauthorized transaction!", {
      duration: 10000,
      description: "TymeBank account compromised. View SOC Alerts for details.",
    });
  }, []);

  const resetSystem = useCallback(() => {
    setState({
      ...defaultState,
      alerts: defaultState.alerts.map((a) => ({ ...a, timestamp: new Date(Date.now() - Math.random() * 7200000) })),
    });

    toast.success("System reset complete", {
      description: "All threat simulations cleared. Status: Secure.",
    });
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== id),
      activeAlerts: Math.max(0, prev.activeAlerts - 1),
      isUnderAttack: prev.alerts.filter((a) => a.id !== id).some((a) => a.severity === "critical") ? prev.isUnderAttack : false,
      riskScore: prev.alerts.filter((a) => a.id !== id).some((a) => a.severity === "critical") ? prev.riskScore : 87,
      grade: prev.alerts.filter((a) => a.id !== id).some((a) => a.severity === "critical") ? prev.grade : "A",
    }));

    toast.info("Alert resolved", { description: "The security alert has been marked as resolved." });
  }, []);

  return (
    <AmajoniContext.Provider value={{ ...state, simulateTheft, resetSystem, resolveAlert }}>
      {children}
    </AmajoniContext.Provider>
  );
}

export function useAmajoni() {
  const context = useContext(AmajoniContext);
  if (!context) {
    throw new Error("useAmajoni must be used within an AmajoniProvider");
  }
  return context;
}
