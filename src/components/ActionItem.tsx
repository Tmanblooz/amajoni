import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItemProps {
  priority: number;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
}

const ActionItem = ({ priority, title, description, impact, effort }: ActionItemProps) => {
  const impactColors = {
    low: "bg-status-healthy/20 text-status-healthy",
    medium: "bg-status-warning/20 text-status-warning",
    high: "bg-status-critical/20 text-status-critical"
  };

  const effortLabels = {
    low: "Quick Win",
    medium: "Moderate",
    high: "Complex"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            {priority}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button size="sm" variant="ghost">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className={cn("text-xs", impactColors[impact])}>
                Impact: {impact.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {effortLabels[effort]}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionItem;
