import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, ShieldX, Info, CheckCircle, Clock, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Alert } from "@/hooks/useMockApi";

interface AlertCardProps {
  alert: Alert;
  onAction?: (alert: Alert) => void;
  onStatusChange?: (alertId: string, status: Alert['status']) => void;
}

const severityConfig = {
  low: { 
    color: 'text-status-info', 
    bgColor: 'bg-status-info/10', 
    borderColor: 'border-status-info/30',
    icon: Info 
  },
  medium: { 
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning/10', 
    borderColor: 'border-status-warning/30',
    icon: AlertTriangle 
  },
  high: { 
    color: 'text-grade-d', 
    bgColor: 'bg-grade-d/10', 
    borderColor: 'border-grade-d/30',
    icon: ShieldAlert 
  },
  critical: { 
    color: 'text-status-critical', 
    bgColor: 'bg-status-critical/10', 
    borderColor: 'border-status-critical/30',
    icon: ShieldX 
  },
};

const statusConfig = {
  open: { color: 'text-status-critical', bgColor: 'bg-status-critical/10', icon: AlertTriangle },
  investigating: { color: 'text-status-warning', bgColor: 'bg-status-warning/10', icon: Search },
  resolved: { color: 'text-status-healthy', bgColor: 'bg-status-healthy/10', icon: CheckCircle },
};

export function AlertCard({ alert, onAction, onStatusChange }: AlertCardProps) {
  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const SeverityIcon = severity.icon;
  const StatusIcon = status.icon;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      alert.status === 'open' && severity.borderColor,
      alert.status === 'open' && "border-l-4"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", severity.bgColor)}>
              <SeverityIcon className={cn("h-5 w-5", severity.color)} />
            </div>
            <div>
              <CardTitle className="text-base">{alert.type}</CardTitle>
              <p className="text-sm text-muted-foreground">{alert.affectedUser}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(severity.bgColor, severity.color)}>
              {alert.severity}
            </Badge>
            <Badge variant="outline" className={cn(status.bgColor, status.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {alert.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{alert.description}</p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
        </div>

        {alert.status === 'open' && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange?.(alert.id, 'investigating')}
              >
                <Search className="h-4 w-4 mr-1" />
                Investigate
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange?.(alert.id, 'resolved')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolve
              </Button>
            </div>
            <Button 
              size="sm" 
              className="bg-primary"
              onClick={() => onAction?.(alert)}
            >
              Take Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AlertCardCompact({ alert }: { alert: Alert }) {
  const severity = severityConfig[alert.severity];
  const SeverityIcon = severity.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      severity.bgColor,
      severity.borderColor
    )}>
      <SeverityIcon className={cn("h-5 w-5 flex-shrink-0", severity.color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{alert.type}</p>
        <p className="text-xs text-muted-foreground truncate">{alert.affectedUser}</p>
      </div>
      <Badge variant="outline" className={cn(severity.bgColor, severity.color, "text-xs")}>
        {alert.severity}
      </Badge>
    </div>
  );
}
