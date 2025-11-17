import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  score: number;
  title: string;
  description: string;
}

const getRiskStatus = (score: number) => {
  if (score >= 81) return { label: "Healthy", color: "text-status-healthy", bg: "bg-status-healthy/10" };
  if (score >= 51) return { label: "Needs Attention", color: "text-status-warning", bg: "bg-status-warning/10" };
  return { label: "Critical", color: "text-status-critical", bg: "bg-status-critical/10" };
};

const RiskScoreCard = ({ score, title, description }: RiskScoreCardProps) => {
  const status = getRiskStatus(score);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <span className="text-6xl font-bold tracking-tight">{score}</span>
            <span className="text-2xl text-muted-foreground mb-2">/100</span>
          </div>
          
          <Progress 
            value={score} 
            className={cn("h-3", score >= 81 ? "[&>div]:bg-status-healthy" : score >= 51 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-critical")}
          />
          
          <div className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold", status.bg, status.color)}>
            {status.label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;
