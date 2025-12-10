import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";

interface MFAStatusIndicatorProps {
  enabled: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MFAStatusIndicator({ enabled, size = 'md', showLabel = true }: MFAStatusIndicatorProps) {
  const sizeClasses = {
    sm: { icon: 'h-4 w-4', text: 'text-xs' },
    md: { icon: 'h-5 w-5', text: 'text-sm' },
    lg: { icon: 'h-6 w-6', text: 'text-base' },
  };

  const Icon = enabled ? ShieldCheck : ShieldX;

  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1 rounded-full w-fit",
      enabled ? "bg-status-healthy/10" : "bg-status-critical/10"
    )}>
      <Icon className={cn(
        sizeClasses[size].icon,
        enabled ? "text-status-healthy" : "text-status-critical"
      )} />
      {showLabel && (
        <span className={cn(
          sizeClasses[size].text,
          "font-medium",
          enabled ? "text-status-healthy" : "text-status-critical"
        )}>
          {enabled ? 'MFA Enabled' : 'MFA Disabled'}
        </span>
      )}
    </div>
  );
}

interface MFAComplianceGaugeProps {
  percentage: number;
}

export function MFAComplianceGauge({ percentage }: MFAComplianceGaugeProps) {
  const getColor = (pct: number) => {
    if (pct >= 80) return 'text-status-healthy';
    if (pct >= 50) return 'text-status-warning';
    return 'text-status-critical';
  };

  const getBgColor = (pct: number) => {
    if (pct >= 80) return 'bg-status-healthy';
    if (pct >= 50) return 'bg-status-warning';
    return 'bg-status-critical';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">MFA Compliance</span>
        <span className={cn("text-2xl font-bold", getColor(percentage))}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getBgColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {percentage >= 80 ? 'Good compliance level' : 
         percentage >= 50 ? 'Needs improvement' : 
         'Critical - many users without MFA'}
      </p>
    </div>
  );
}
