import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarCardProps {
  title: string;
  score: number;
  weight: number;
  icon: LucideIcon;
  issues: number;
}

const PillarCard = ({ title, score, weight, icon: Icon, issues }: PillarCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 81) return "text-status-healthy";
    if (score >= 51) return "text-status-warning";
    return "text-status-critical";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", getScoreColor(score))}>{score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          
          <Progress 
            value={score} 
            className={cn("h-2", score >= 81 ? "[&>div]:bg-status-healthy" : score >= 51 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-critical")}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Weight: {weight}%</span>
            <span>{issues} {issues === 1 ? 'issue' : 'issues'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PillarCard;
