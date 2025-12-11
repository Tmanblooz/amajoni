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
  threatType: string | null;
}

interface AmajoniContextType extends AmajoniState {
  simulateTheft: () => void;
  simulateImpossibleTravel: () => void;
  simulateBruteForce: () => void;
  simulateShadowApp: () => void;
  simulateSIMSwap: () => void;
  simulatePhishing: () => void;
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
  threatType: null,
};

const AmajoniContext = createContext<AmajoniContextType | undefined>(undefined);

export function AmajoniProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AmajoniState>(defaultState);

  const triggerThreat = useCallback((alert: Alert, riskScore: number, grade: "A" | "B" | "C" | "D" | "F", threatType: string) => {
    setState((prev) => ({
      ...prev,
      isUnderAttack: true,
      riskScore,
      grade,
      alerts: [alert, ...prev.alerts],
      activeAlerts: prev.activeAlerts + 1,
      threatType,
    }));
  }, []);

  const simulateTheft = useCallback(() => {
    const alert: Alert = {
      id: `theft-${Date.now()}`,
      title: "🚨 CRITICAL: Unauthorized Transaction",
      message: "R20,000 outflow detected on TymeBank. Immediate action required!",
      severity: "critical",
      timestamp: new Date(),
    };
    triggerThreat(alert, 28, "F", "Financial Theft");
    toast.error("🚨 THREAT DETECTED: R20,000 unauthorized transaction!", {
      duration: 10000,
      description: "TymeBank account compromised. View SOC Alerts for details.",
    });
  }, [triggerThreat]);

  const simulateImpossibleTravel = useCallback(() => {
    const alert: Alert = {
      id: `travel-${Date.now()}`,
      title: "⚠️ Impossible Travel Detected",
      message: "admin@company.co.za logged in from Johannesburg and Lagos within 15 minutes. Account may be compromised.",
      severity: "critical",
      timestamp: new Date(),
    };
    triggerThreat(alert, 35, "F", "Impossible Travel");
    toast.error("⚠️ Impossible Travel Alert!", {
      duration: 8000,
      description: "Login from two countries detected. Possible credential theft.",
    });
  }, [triggerThreat]);

  const simulateBruteForce = useCallback(() => {
    const alert: Alert = {
      id: `brute-${Date.now()}`,
      title: "🔐 Brute Force Attack",
      message: "47 failed login attempts on finance@company.co.za from IP 41.215.xxx.xxx (Nigeria). Account temporarily locked.",
      severity: "high",
      timestamp: new Date(),
    };
    triggerThreat(alert, 52, "D", "Brute Force");
    toast.warning("🔐 Brute Force Attack Detected!", {
      duration: 8000,
      description: "Multiple failed login attempts. Account has been locked.",
    });
  }, [triggerThreat]);

  const simulateShadowApp = useCallback(() => {
    const alert: Alert = {
      id: `shadow-${Date.now()}`,
      title: "👁️ Malicious OAuth App",
      message: "'Free Invoice Generator' app requested full mailbox access for 5 users. High-risk permissions detected.",
      severity: "high",
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      isUnderAttack: true,
      riskScore: 48,
      grade: "D",
      alerts: [alert, ...prev.alerts],
      activeAlerts: prev.activeAlerts + 1,
      shadowApps: prev.shadowApps + 1,
      threatType: "Shadow IT",
    }));
    toast.warning("👁️ Risky Shadow App Detected!", {
      duration: 8000,
      description: "New OAuth app with dangerous permissions. Review Access & Shadow IT.",
    });
  }, []);

  const simulateSIMSwap = useCallback(() => {
    const alert: Alert = {
      id: `sim-${Date.now()}`,
      title: "📱 SIM Swap Attack",
      message: "Carrier reports SIM change for phone linked to CEO account. Banking 2FA may be compromised.",
      severity: "critical",
      timestamp: new Date(),
    };
    triggerThreat(alert, 22, "F", "SIM Swap");
    toast.error("📱 SIM Swap Detected!", {
      duration: 10000,
      description: "CEO's phone number transferred. Banking fraud imminent!",
    });
  }, [triggerThreat]);

  const simulatePhishing = useCallback(() => {
    const alert: Alert = {
      id: `phish-${Date.now()}`,
      title: "🎣 Phishing Credentials Used",
      message: "HR manager clicked phishing link and entered Microsoft 365 credentials. Attacker now has access.",
      severity: "critical",
      timestamp: new Date(),
    };
    triggerThreat(alert, 31, "F", "Phishing");
    toast.error("🎣 Phishing Attack Successful!", {
      duration: 10000,
      description: "Employee credentials stolen. Session hijack in progress.",
    });
  }, [triggerThreat]);

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
    setState((prev) => {
      const remainingAlerts = prev.alerts.filter((a) => a.id !== id);
      const hasCritical = remainingAlerts.some((a) => a.severity === "critical" || a.severity === "high");
      return {
        ...prev,
        alerts: remainingAlerts,
        activeAlerts: Math.max(0, prev.activeAlerts - 1),
        isUnderAttack: hasCritical,
        riskScore: hasCritical ? prev.riskScore : 87,
        grade: hasCritical ? prev.grade : "A",
        threatType: hasCritical ? prev.threatType : null,
      };
    });
    toast.info("Alert resolved", { description: "The security alert has been marked as resolved." });
  }, []);

  return (
    <AmajoniContext.Provider value={{ 
      ...state, 
      simulateTheft, 
      simulateImpossibleTravel, 
      simulateBruteForce, 
      simulateShadowApp, 
      simulateSIMSwap, 
      simulatePhishing,
      resetSystem, 
      resolveAlert 
    }}>
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
