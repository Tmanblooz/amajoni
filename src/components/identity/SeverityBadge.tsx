import { cn } from "@/lib/utils";
import { AlertTriangle, Info, ShieldAlert, ShieldX } from "lucide-react";

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
}

const severityConfig = {
  low: { 
    color: 'text-status-info', 
    bgColor: 'bg-status-info/10', 
    borderColor: 'border-status-info/30',
    icon: Info,
    label: 'Low'
  },
  medium: { 
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning/10', 
    borderColor: 'border-status-warning/30',
    icon: AlertTriangle,
    label: 'Medium'
  },
  high: { 
    color: 'text-grade-d', 
    bgColor: 'bg-grade-d/10', 
    borderColor: 'border-grade-d/30',
    icon: ShieldAlert,
    label: 'High'
  },
  critical: { 
    color: 'text-status-critical', 
    bgColor: 'bg-status-critical/10', 
    borderColor: 'border-status-critical/30',
    icon: ShieldX,
    label: 'Critical'
  },
};

export function SeverityBadge({ severity, showIcon = true }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border",
      config.bgColor,
      config.borderColor,
      config.color
    )}>
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </div>
  );
}
