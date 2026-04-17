import { useAmajoni } from "@/contexts/AmajoniContext";
import { KPICard } from "@/components/amajoniid/KPICard";
import { useFinanceData } from "@/hooks/useAmajoniApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShieldCheck, ShieldAlert, Smartphone, Cpu, Wifi, CheckCircle, XCircle,
  AlertTriangle, Shield, CreditCard, AlertCircle, Building, ArrowUpRight,
  UserPlus, Ban, Check,
} from "lucide-react";

const fmtZAR = (n: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const txStatusVariant: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
  blocked: "outline",
  flagged: "destructive",
  pending: "secondary",
  approved: "default",
};

export default function FinanceShield() {
  const { isUnderAttack: ctxAttack } = useAmajoni();
  const { data: finance } = useFinanceData(2000);

  const isUnderAttack = finance?.isUnderAttack ?? ctxAttack;
  const accounts = finance?.accounts ?? [
    { id: "acc1", name: "TymeBank Business", balance: 482000, currency: "ZAR" },
    { id: "acc2", name: "FNB Commercial", balance: 1240000, currency: "ZAR" },
    { id: "acc3", name: "Standard Bank", balance: 765000, currency: "ZAR" },
    { id: "acc4", name: "Capitec Business", balance: 198000, currency: "ZAR" },
  ];
  const transactions = finance?.transactions ?? [];
  const beneficiaryChanges = finance?.beneficiaryChanges ?? [];
  const blockedToday = finance?.blockedToday ?? 0;
  const flaggedToday = finance?.flaggedToday ?? 0;

  const checks = [
    { icon: Smartphone, label: "SIM Swap Monitor", status: isUnderAttack ? "threat" : "safe", description: isUnderAttack ? "Suspicious SIM activity detected" : "No unauthorized SIM changes" },
    { icon: Cpu, label: "Device Root Check", status: "safe", description: "Device integrity verified" },
    { icon: Wifi, label: "WiFi Security", status: "warning", description: "Connected to public network" },
  ];

  const approve = (id: string) => toast.warning("Manual approval required", { description: `Tx ${id} would route to dual-approval workflow.` });
  const block = (id: string) => toast.success("Transaction blocked", { description: `Tx ${id} held in escrow.` });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">FinanceShield</h1>
        <p className="text-muted-foreground mt-1">Real-time banking & transaction protection</p>
      </div>

      {/* Status Hero */}
      <div className={`rounded-2xl p-8 text-center border transition-all duration-500 ${
        isUnderAttack ? "bg-status-danger/10 border-status-danger/30" : "bg-status-safe/10 border-status-safe/30"
      }`}>
        {isUnderAttack ? (
          <>
            <ShieldAlert className="h-20 w-20 text-status-danger mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-status-danger">THREAT DETECTED</h2>
            <p className="text-muted-foreground mt-2">Suspicious financial activity in progress. Review flagged items below.</p>
          </>
        ) : (
          <>
            <ShieldCheck className="h-20 w-20 text-status-safe mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-status-safe">Banking Protection Active</h2>
            <p className="text-muted-foreground mt-2">Transactions monitored in real-time across {accounts.length} accounts.</p>
          </>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Protected Accounts" value={`${accounts.length}/${accounts.length}`} icon={Shield} variant={isUnderAttack ? "danger" : "safe"} />
        <KPICard title="Transactions Today" value={String(transactions.length)} icon={CreditCard} variant="default" />
        <KPICard title="Flagged Today" value={String(flaggedToday)} icon={AlertCircle} variant={flaggedToday > 0 ? "danger" : "safe"} />
        <KPICard title="Auto-Blocked" value={String(blockedToday)} icon={Ban} variant={blockedToday > 0 ? "warning" : "safe"} />
      </div>

      {/* Live Transaction Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Live Transaction Feed</h3>
          </div>
          <Badge variant="outline">Polling 2s</Badge>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions in window.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    tx.status === "flagged" ? "border-status-danger/30 bg-status-danger/5"
                    : tx.status === "blocked" ? "border-status-warning/30 bg-status-warning/5"
                    : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">{tx.beneficiary}</p>
                      <Badge variant={txStatusVariant[tx.status]} className="text-[10px] uppercase">{tx.status}</Badge>
                      {tx.risk === "critical" && <Badge variant="destructive" className="text-[10px]">Critical Risk</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tx.account} · {new Date(tx.timestamp).toLocaleTimeString()}</p>
                    {tx.reason && <p className="text-xs text-status-danger mt-1">⚠ {tx.reason}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold ${tx.status === "flagged" || tx.status === "blocked" ? "text-status-danger" : "text-foreground"}`}>
                      {fmtZAR(tx.amount)}
                    </p>
                  </div>
                  {tx.status === "flagged" && (
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => block(tx.id)}>
                        <Ban className="h-3.5 w-3.5 mr-1" /> Block
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => approve(tx.id)}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Beneficiary Changes */}
      {beneficiaryChanges.length > 0 && (
        <div className="bg-card border border-status-danger/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-status-danger" />
            <h3 className="text-lg font-semibold text-foreground">Recent Beneficiary Changes</h3>
          </div>
          <div className="space-y-2">
            {beneficiaryChanges.map((bc) => (
              <div key={bc.id} className="flex items-start gap-3 p-3 rounded-lg border border-status-danger/20 bg-status-danger/5">
                <AlertTriangle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">{bc.account}</span>: <span className="text-muted-foreground line-through">{bc.oldBeneficiary}</span> → <span className="text-status-danger font-medium">{bc.newBeneficiary}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">By {bc.changedBy} · {new Date(bc.timestamp).toLocaleTimeString()}</p>
                </div>
                <Badge variant="destructive" className="uppercase text-[10px]">{bc.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Checklist */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Checklist</h3>
        <div className="space-y-4">
          {checks.map((check, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              check.status === "threat" ? "bg-status-danger/5 border-status-danger/20"
              : check.status === "warning" ? "bg-status-warning/5 border-status-warning/20"
              : "bg-secondary/50 border-border"
            }`}>
              <div className={`p-3 rounded-lg ${
                check.status === "threat" ? "bg-status-danger/10"
                : check.status === "warning" ? "bg-status-warning/10"
                : "bg-status-safe/10"
              }`}>
                <check.icon className={`h-5 w-5 ${
                  check.status === "threat" ? "text-status-danger"
                  : check.status === "warning" ? "text-status-warning"
                  : "text-status-safe"
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{check.label}</p>
                <p className="text-sm text-muted-foreground">{check.description}</p>
              </div>
              {check.status === "safe" ? <CheckCircle className="h-5 w-5 text-status-safe" />
                : check.status === "warning" ? <AlertTriangle className="h-5 w-5 text-status-warning" />
                : <XCircle className="h-5 w-5 text-status-danger" />}
            </div>
          ))}
        </div>
      </div>

      {/* Protected Accounts */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Protected Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const compromised = isUnderAttack && acc.name === "TymeBank Business";
            return (
              <div key={acc.id} className={`flex items-center gap-3 p-3 rounded-lg border ${compromised ? "bg-status-danger/5 border-status-danger/30" : "bg-secondary/50 border-border"}`}>
                <div className={`p-2 rounded-lg ${compromised ? "bg-status-danger/10" : "bg-muted"}`}>
                  <Building className={`h-5 w-5 ${compromised ? "text-status-danger" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{acc.name}</p>
                  <p className="text-xs text-muted-foreground">{fmtZAR(acc.balance)}</p>
                </div>
                <Badge variant={compromised ? "destructive" : "outline"} className="text-[10px]">
                  {compromised ? "Suspicious" : "Protected"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
