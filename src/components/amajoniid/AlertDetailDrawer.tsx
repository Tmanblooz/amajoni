import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, acknowledgeAlert, resolveAlertApi } from "@/hooks/useAmajoniApi";
import { CheckCircle2, ShieldCheck, Clock, User, Tag, Zap } from "lucide-react";
import { toast } from "sonner";

interface AlertDetailDrawerProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: () => void;
}

const sevVariant = (s: string): "destructive" | "secondary" | "outline" =>
  s === "critical" || s === "high" ? "destructive" : s === "medium" ? "secondary" : "outline";

export function AlertDetailDrawer({ alert, open, onOpenChange, onAction }: AlertDetailDrawerProps) {
  if (!alert) return null;

  const ack = async () => {
    const ok = await acknowledgeAlert(alert.id);
    if (ok) {
      toast.success("Alert acknowledged");
      onAction();
    }
  };
  const resolve = async () => {
    const ok = await resolveAlertApi(alert.id);
    if (ok) {
      toast.success("Alert resolved", { description: "Removed from active queue." });
      onAction();
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={sevVariant(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
            {alert.acknowledged && <Badge variant="outline">Acknowledged</Badge>}
          </div>
          <SheetTitle className="text-left">{alert.title}</SheetTitle>
          <SheetDescription className="text-left">{alert.message}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{alert.timestamp.toLocaleString()}</span>
            </div>
            {alert.user && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate">{alert.user}</span>
              </div>
            )}
            {alert.category && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="capitalize">{alert.category.replace("_", " ")}</span>
              </div>
            )}
          </div>

          {alert.recommendedAction && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Recommended Response</span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.recommendedAction}</p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Investigation Steps</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Confirm the affected user via independent channel.</li>
              <li>Inspect related sign-in & audit logs for the past 24h.</li>
              <li>Apply the recommended response above.</li>
              <li>Document outcome in the incident log.</li>
            </ol>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row gap-2">
          <Button variant="outline" onClick={ack} disabled={alert.acknowledged} className="flex-1">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Acknowledge
          </Button>
          <Button onClick={resolve} className="flex-1">
            <ShieldCheck className="h-4 w-4 mr-2" /> Resolve
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
