import { motion } from "framer-motion";
import { Sparkles, AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Highlight } from "@/hooks/useAmajoniApi";

interface ExecutiveSummaryProps {
  riskScore: number;
  grade: string;
  isUnderAttack: boolean;
  threatType?: string;
  criticalAlerts: number;
  highAlerts: number;
  mfaPercentage: number;
  highlights: Highlight[];
}

function buildBriefing(p: ExecutiveSummaryProps): string {
  if (p.isUnderAttack) {
    return `Active ${p.threatType ?? "incident"} detected. ${p.criticalAlerts} critical and ${p.highAlerts} high-severity alerts require immediate triage. Risk score elevated to ${p.riskScore} (Grade ${p.grade}).`;
  }
  if (p.criticalAlerts + p.highAlerts > 0) {
    return `${p.criticalAlerts + p.highAlerts} unresolved high-priority alerts. Posture remains acceptable at ${p.riskScore}/100 (Grade ${p.grade}).`;
  }
  if (p.mfaPercentage < 90) {
    return `Posture is healthy (${p.riskScore}/100, Grade ${p.grade}). Top opportunity: lift MFA coverage from ${p.mfaPercentage}% toward 100%.`;
  }
  return `All systems normal. Risk ${p.riskScore}/100 (Grade ${p.grade}). MFA at ${p.mfaPercentage}%. No action required.`;
}

const iconFor = (t: Highlight["type"]) =>
  t === "critical" ? AlertOctagon : t === "warning" ? AlertTriangle : CheckCircle2;

const colorFor = (t: Highlight["type"]) =>
  t === "critical" ? "text-status-danger" : t === "warning" ? "text-status-warning" : "text-status-safe";

export function ExecutiveSummary(props: ExecutiveSummaryProps) {
  const briefing = buildBriefing(props);
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Executive Briefing</h3>
          <p className="text-xs text-muted-foreground">Auto-generated summary of current posture</p>
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-5">{briefing}</p>
      <div className="space-y-2">
        {props.highlights.map((h, i) => {
          const Icon = iconFor(h.type);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 text-sm"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${colorFor(h.type)}`} />
              <span className="text-muted-foreground">{h.text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
