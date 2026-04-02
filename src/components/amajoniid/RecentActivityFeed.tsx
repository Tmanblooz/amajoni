import { User, Smartphone, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const recentActivity = [
  { icon: User, text: "User ken@company.co.za logged in from Johannesburg", time: "5 min ago", type: "login" },
  { icon: Smartphone, text: "New device detected: iPhone 15 Pro", time: "1 hour ago", type: "device" },
  { icon: User, text: "Admin user changed password successfully", time: "2 hours ago", type: "security" },
  { icon: CheckCircle, text: "MFA enabled for finance@company.co.za", time: "3 hours ago", type: "mfa" },
  { icon: User, text: "User thabo@company.co.za accessed HR portal", time: "4 hours ago", type: "login" },
  { icon: CheckCircle, text: "Weekly security scan completed — no issues", time: "5 hours ago", type: "scan" },
];

const typeColors: Record<string, string> = {
  login: "bg-primary/10 text-primary",
  device: "bg-status-warning/10 text-status-warning",
  security: "bg-status-safe/10 text-status-safe",
  mfa: "bg-status-safe/10 text-status-safe",
  scan: "bg-accent/10 text-accent",
};

export function RecentActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">Live</span>
      </div>
      <div className="space-y-3">
        {recentActivity.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 text-sm p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${typeColors[activity.type] || "bg-secondary text-muted-foreground"}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">{activity.text}</p>
            </div>
            <span className="text-muted-foreground text-xs whitespace-nowrap">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
