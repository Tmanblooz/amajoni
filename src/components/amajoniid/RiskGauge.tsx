import { useMemo } from "react";

interface RiskGaugeProps {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
}

export function RiskGauge({ score, grade }: RiskGaugeProps) {
  const { ringColor, glowClass } = useMemo(() => {
    if (score >= 80) {
      return { ringColor: "stroke-status-safe", glowClass: "glow-safe" };
    } else if (score >= 50) {
      return { ringColor: "stroke-status-warning", glowClass: "glow-warning" };
    } else {
      return { ringColor: "stroke-status-danger", glowClass: "glow-danger" };
    }
  }, [score]);

  const circumference = 2 * Math.PI * 90;
  const progress = (score / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center p-8 rounded-2xl bg-card border border-border ${glowClass}`}>
      <div className="relative">
        <svg width="220" height="220" className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            strokeWidth="12"
            className="stroke-muted"
          />
          {/* Progress ring */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-bold ${
            score >= 80 ? "text-status-safe" : score >= 50 ? "text-status-warning" : "text-status-danger"
          }`}>
            {grade}
          </span>
          <span className="text-2xl font-medium text-muted-foreground mt-1">{score}/100</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-foreground mt-4">Overall Risk Score</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {score >= 80 ? "Your systems are secure" : score >= 50 ? "Some issues need attention" : "Critical issues detected"}
      </p>
    </div>
  );
}
