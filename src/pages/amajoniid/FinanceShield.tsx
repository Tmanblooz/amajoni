import { useAmajoni } from "@/contexts/AmajoniContext";
import { KPICard } from "@/components/amajoniid/KPICard";
import { ShieldCheck, ShieldAlert, Smartphone, Cpu, Wifi, CheckCircle, XCircle, AlertTriangle, Shield, CreditCard, AlertCircle, Building } from "lucide-react";

export default function FinanceShield() {
  const { isUnderAttack } = useAmajoni();

  const checks = [
    { 
      icon: Smartphone, 
      label: "SIM Swap Monitor", 
      status: isUnderAttack ? "threat" : "safe",
      description: isUnderAttack ? "Suspicious SIM activity detected" : "No unauthorized SIM changes"
    },
    { 
      icon: Cpu, 
      label: "Device Root Check", 
      status: "safe",
      description: "Device integrity verified"
    },
    { 
      icon: Wifi, 
      label: "WiFi Security", 
      status: "warning",
      description: "Connected to public network"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="h-5 w-5 text-status-safe" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-status-warning" />;
      case "threat":
        return <XCircle className="h-5 w-5 text-status-danger" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">FinanceShield</h1>
        <p className="text-muted-foreground mt-1">
          Banking and financial transaction protection
        </p>
      </div>

      {/* Status Hero */}
      <div className={`rounded-2xl p-8 text-center border transition-all duration-500 ${
        isUnderAttack 
          ? "bg-status-danger/10 border-status-danger/30" 
          : "bg-status-safe/10 border-status-safe/30"
      }`}>
        {isUnderAttack ? (
          <>
            <ShieldAlert className="h-20 w-20 text-status-danger mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-status-danger">THREAT DETECTED</h2>
            <p className="text-muted-foreground mt-2">
              Suspicious financial activity detected. Review SOC Alerts immediately.
            </p>
          </>
        ) : (
          <>
            <ShieldCheck className="h-20 w-20 text-status-safe mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-status-safe">Banking Protection Active</h2>
            <p className="text-muted-foreground mt-2">
              Your financial transactions are being monitored in real-time.
            </p>
          </>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Protected Accounts"
          value="4/4"
          icon={Shield}
          variant={isUnderAttack ? "danger" : "safe"}
        />
        <KPICard
          title="Transactions Today"
          value={isUnderAttack ? "48" : "47"}
          icon={CreditCard}
          variant="default"
        />
        <KPICard
          title="Blocked Attempts"
          value={isUnderAttack ? "1" : "0"}
          icon={AlertCircle}
          variant={isUnderAttack ? "danger" : "safe"}
        />
      </div>

      {/* Security Checklist */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Checklist</h3>
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                check.status === "threat" 
                  ? "bg-status-danger/5 border-status-danger/20" 
                  : check.status === "warning"
                  ? "bg-status-warning/5 border-status-warning/20"
                  : "bg-secondary/50 border-border"
              }`}
            >
              <div className={`p-3 rounded-lg ${
                check.status === "threat" 
                  ? "bg-status-danger/10" 
                  : check.status === "warning"
                  ? "bg-status-warning/10"
                  : "bg-status-safe/10"
              }`}>
                <check.icon className={`h-5 w-5 ${
                  check.status === "threat" 
                    ? "text-status-danger" 
                    : check.status === "warning"
                    ? "text-status-warning"
                    : "text-status-safe"
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{check.label}</p>
                <p className="text-sm text-muted-foreground">{check.description}</p>
              </div>
              {getStatusIcon(check.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Protected Accounts */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Protected Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["TymeBank Business", "FNB Commercial", "Standard Bank", "Capitec Business"].map((bank, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="p-2 rounded-lg bg-muted">
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{bank}</p>
                <p className={`text-xs ${isUnderAttack && bank === "TymeBank Business" ? "text-status-danger" : "text-status-safe"}`}>
                  {isUnderAttack && bank === "TymeBank Business" ? "Suspicious activity" : "Protected"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
