import { Shield, Key, UserX, Eye, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Key, label: "Enforce MFA", desc: "3 users without MFA", path: "/amajoniid/settings", color: "text-status-warning" },
  { icon: UserX, label: "Review Dormant", desc: "2 inactive accounts", path: "/amajoniid", color: "text-status-warning" },
  { icon: Eye, label: "Audit Shadow IT", desc: "Review connected apps", path: "/amajoniid/shadow-access", color: "text-primary" },
  { icon: Shield, label: "View Alerts", desc: "Check SOC feed", path: "/amajoniid/soc-alerts", color: "text-status-danger" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left group"
          >
            <div className={`p-2 rounded-lg bg-secondary ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
