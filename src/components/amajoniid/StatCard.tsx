import { LucideIcon } from "lucide-react";
import { MiniSparkline } from "./MiniSparkline";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number[];
  trendColor?: "safe" | "warning" | "danger" | "accent";
  variant?: "default" | "safe" | "warning" | "danger";
  onClick?: () => void;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendColor = "accent",
  variant = "default",
  onClick 
}: StatCardProps) {
  const variantStyles = {
    default: "border-border hover:border-primary/30",
    safe: "border-status-safe/30 bg-status-safe/5 hover:border-status-safe/50",
    warning: "border-status-warning/30 bg-status-warning/5 hover:border-status-warning/50",
    danger: "border-status-danger/30 bg-status-danger/5 hover:border-status-danger/50",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10",
    safe: "text-status-safe bg-status-safe/10",
    warning: "text-status-warning bg-status-warning/10",
    danger: "text-status-danger bg-status-danger/10",
  };

  return (
    <div 
      className={`p-5 rounded-xl bg-card border ${variantStyles[variant]} transition-all hover:scale-[1.02] ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && <MiniSparkline data={trend} color={trendColor} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
