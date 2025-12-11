import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "safe" | "warning" | "danger";
}

export function KPICard({ title, value, icon: Icon, variant = "default" }: KPICardProps) {
  const variantStyles = {
    default: "border-border",
    safe: "border-status-safe/30 bg-status-safe/5",
    warning: "border-status-warning/30 bg-status-warning/5",
    danger: "border-status-danger/30 bg-status-danger/5",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10",
    safe: "text-status-safe bg-status-safe/10",
    warning: "text-status-warning bg-status-warning/10",
    danger: "text-status-danger bg-status-danger/10",
  };

  return (
    <div className={`p-6 rounded-xl bg-card border ${variantStyles[variant]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
