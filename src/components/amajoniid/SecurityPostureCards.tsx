import { Shield, Lock, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface SecurityPostureCardsProps {
  isUnderAttack: boolean;
  shadowApps: number;
  mfaPercentage: number;
}

function PostureCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  label, 
  value, 
  percentage, 
  variant 
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  label: string;
  value: string;
  percentage: number;
  variant: "safe" | "warning" | "danger";
}) {
  const colors = {
    safe: { icon: "text-status-safe", bg: "bg-status-safe/10", bar: "bg-status-safe", text: "text-status-safe" },
    warning: { icon: "text-status-warning", bg: "bg-status-warning/10", bar: "bg-status-warning", text: "text-status-warning" },
    danger: { icon: "text-status-danger", bg: "bg-status-danger/10", bar: "bg-status-danger", text: "text-status-danger" },
  };
  const c = colors[variant];

  return (
    <motion.div 
      className="bg-card border border-border rounded-xl p-5"
      whileHover={{ y: -2, boxShadow: "0 8px 30px -12px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className={`font-medium ${c.text}`}>{value}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${c.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function SecurityPostureCards({ isUnderAttack, shadowApps, mfaPercentage }: SecurityPostureCardsProps) {
  const leastPrivilege = isUnderAttack ? 65 : 92;
  const appsReviewed = Math.max(0, 8 - shadowApps);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PostureCard
        icon={Shield}
        title="Identity Protection"
        subtitle="Authentication status"
        label="MFA Coverage"
        value={`${mfaPercentage}%`}
        percentage={mfaPercentage}
        variant="safe"
      />
      <PostureCard
        icon={Lock}
        title="Access Control"
        subtitle="Permission hygiene"
        label="Least Privilege"
        value={`${leastPrivilege}%`}
        percentage={leastPrivilege}
        variant={isUnderAttack ? "danger" : "safe"}
      />
      <PostureCard
        icon={Eye}
        title="Shadow IT"
        subtitle="Unauthorized apps"
        label="Apps Reviewed"
        value={`${appsReviewed}/8`}
        percentage={(appsReviewed / 8) * 100}
        variant={shadowApps > 3 ? "warning" : "safe"}
      />
    </div>
  );
}
