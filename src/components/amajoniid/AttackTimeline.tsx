import { motion } from "framer-motion";
import { AlertOctagon, Clock } from "lucide-react";
import { Alert } from "@/hooks/useAmajoniApi";

interface AttackTimelineProps {
  alerts: Alert[];
  threatType?: string;
  attackElapsedMs: number;
}

const sevColor: Record<string, string> = {
  critical: "border-status-danger bg-status-danger/5 text-status-danger",
  high: "border-status-danger/60 bg-status-danger/5 text-status-danger",
  medium: "border-status-warning/60 bg-status-warning/5 text-status-warning",
  low: "border-status-safe/60 bg-status-safe/5 text-status-safe",
};

export function AttackTimeline({ alerts, threatType, attackElapsedMs }: AttackTimelineProps) {
  const attackAlerts = alerts.filter(a => a.category === "attack").slice().reverse();
  const seconds = Math.floor(attackElapsedMs / 1000);

  return (
    <div className="bg-card border border-status-danger/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-status-danger/10">
            <AlertOctagon className="h-5 w-5 text-status-danger animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Attack Kill-Chain: {threatType}</h3>
            <p className="text-xs text-muted-foreground">Stages observed in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" /> {seconds}s elapsed
        </div>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
        {attackAlerts.length === 0 && (
          <p className="text-sm text-muted-foreground">Awaiting first stage…</p>
        )}
        {attackAlerts.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative mb-3 p-3 rounded-lg border ${sevColor[a.severity] ?? sevColor.medium}`}
          >
            <span className="absolute -left-[18px] top-4 h-3 w-3 rounded-full bg-status-danger ring-4 ring-background" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 break-words">{a.message}</p>
              </div>
              <span className="text-xs uppercase tracking-wide shrink-0">{a.severity}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
