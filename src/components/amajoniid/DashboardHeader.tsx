import { Loader2, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  isUnderAttack: boolean;
  loading: boolean;
  hasApiData: boolean;
  error: string | null;
}

export function DashboardHeader({ isUnderAttack, loading, hasApiData, error }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {isUnderAttack
            ? "⚠️ Active threat detected — immediate action required"
            : "Real-time identity and access monitoring"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {loading && !hasApiData && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Connecting...</span>
          </div>
        )}
        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-status-warning bg-status-warning/10 px-3 py-1.5 rounded-full">
            <WifiOff className="h-3 w-3" />
            Offline mode
          </div>
        ) : hasApiData ? (
          <div className="flex items-center gap-1.5 text-xs text-status-safe bg-status-safe/10 px-3 py-1.5 rounded-full">
            <Wifi className="h-3 w-3" />
            Live
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
