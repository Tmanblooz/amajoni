import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

interface RiskScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskScoreBadge({ score, size = 'md', showLabel = true }: RiskScoreBadgeProps) {
  const getGrade = (score: number): { grade: string; color: string; bgColor: string; icon: typeof Shield } => {
    if (score >= 80) return { grade: 'A', color: 'text-grade-a', bgColor: 'bg-grade-a/10', icon: ShieldCheck };
    if (score >= 60) return { grade: 'B', color: 'text-grade-b', bgColor: 'bg-grade-b/10', icon: ShieldCheck };
    if (score >= 40) return { grade: 'C', color: 'text-grade-c', bgColor: 'bg-grade-c/10', icon: Shield };
    if (score >= 20) return { grade: 'D', color: 'text-grade-d', bgColor: 'bg-grade-d/10', icon: ShieldAlert };
    return { grade: 'F', color: 'text-grade-f', bgColor: 'bg-grade-f/10', icon: ShieldX };
  };

  const { grade, color, bgColor, icon: Icon } = getGrade(100 - score); // Invert score (lower is better)

  const sizeClasses = {
    sm: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-xs' },
    md: { container: 'h-12 w-12', icon: 'h-6 w-6', text: 'text-sm' },
    lg: { container: 'h-20 w-20', icon: 'h-10 w-10', text: 'text-lg' },
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "rounded-full flex items-center justify-center font-bold",
        bgColor,
        color,
        sizeClasses[size].container
      )}>
        <span className={sizeClasses[size].text}>{grade}</span>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-semibold", color, sizeClasses[size].text)}>
            Grade {grade}
          </span>
          <span className="text-xs text-muted-foreground">
            Score: {100 - score}/100
          </span>
        </div>
      )}
    </div>
  );
}

interface OverallRiskGradeProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
}

export function OverallRiskGrade({ grade, score }: OverallRiskGradeProps) {
  const gradeConfig = {
    A: { color: 'text-grade-a', bgColor: 'bg-grade-a/10', borderColor: 'border-grade-a/30', label: 'Excellent' },
    B: { color: 'text-grade-b', bgColor: 'bg-grade-b/10', borderColor: 'border-grade-b/30', label: 'Good' },
    C: { color: 'text-grade-c', bgColor: 'bg-grade-c/10', borderColor: 'border-grade-c/30', label: 'Fair' },
    D: { color: 'text-grade-d', bgColor: 'bg-grade-d/10', borderColor: 'border-grade-d/30', label: 'Poor' },
    F: { color: 'text-grade-f', bgColor: 'bg-grade-f/10', borderColor: 'border-grade-f/30', label: 'Critical' },
  };

  const config = gradeConfig[grade];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 rounded-xl border-2",
      config.bgColor,
      config.borderColor
    )}>
      <span className={cn("text-6xl font-bold", config.color)}>{grade}</span>
      <span className={cn("text-lg font-medium mt-1", config.color)}>{config.label}</span>
      <span className="text-sm text-muted-foreground mt-1">Score: {score}/100</span>
    </div>
  );
}
