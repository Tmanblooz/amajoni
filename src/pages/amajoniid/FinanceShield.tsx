import { Landmark, Shield, CheckCircle, AlertCircle, CreditCard, Building } from "lucide-react";
import { KPICard } from "@/components/amajoniid/KPICard";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  status: "protected" | "at-risk" | "unmonitored";
  lastActivity: string;
}

const mockAccounts: BankAccount[] = [
  {
    id: "1",
    name: "Main Business Account",
    bank: "FNB Business",
    status: "protected",
    lastActivity: "Today, 14:32",
  },
  {
    id: "2",
    name: "TymeBank Account",
    bank: "TymeBank",
    status: "protected",
    lastActivity: "Today, 09:15",
  },
  {
    id: "3",
    name: "Petty Cash Account",
    bank: "Capitec",
    status: "at-risk",
    lastActivity: "Yesterday, 16:45",
  },
];

export default function FinanceShield() {
  const statusConfig = {
    protected: {
      icon: CheckCircle,
      color: "text-status-safe",
      bg: "bg-status-safe/10",
      label: "Protected",
    },
    "at-risk": {
      icon: AlertCircle,
      color: "text-status-danger",
      bg: "bg-status-danger/10",
      label: "At Risk",
    },
    unmonitored: {
      icon: Shield,
      color: "text-muted-foreground",
      bg: "bg-muted",
      label: "Unmonitored",
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Landmark className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">FinanceShield</h1>
          <p className="text-muted-foreground">Banking and transaction protection</p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Protected Accounts"
          value="2/3"
          icon={Shield}
          variant="safe"
        />
        <KPICard
          title="Transactions Today"
          value="47"
          icon={CreditCard}
          variant="default"
        />
        <KPICard
          title="Blocked Attempts"
          value="0"
          icon={AlertCircle}
          variant="safe"
        />
      </div>

      {/* Bank Accounts */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Connected Accounts</h2>
        <div className="space-y-4">
          {mockAccounts.map((account) => {
            const config = statusConfig[account.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <Building className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{account.bank}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="text-sm font-medium text-foreground">{account.lastActivity}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
