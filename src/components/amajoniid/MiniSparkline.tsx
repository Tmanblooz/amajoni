import { useMemo } from "react";

interface MiniSparklineProps {
  data: number[];
  color?: "safe" | "warning" | "danger" | "accent";
  width?: number;
  height?: number;
}

export function MiniSparkline({ data, color = "accent", width = 80, height = 24 }: MiniSparklineProps) {
  const colorMap = {
    safe: "hsl(160, 84%, 39%)",
    warning: "hsl(38, 92%, 50%)",
    danger: "hsl(347, 77%, 50%)",
    accent: "hsl(239, 84%, 67%)",
  };

  const pathData = useMemo(() => {
    if (data.length === 0) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    
    return data
      .map((val, i) => {
        const x = i * stepX;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [data, width, height]);

  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const strokeColor = colorMap[color];

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {trend !== 0 && (
        <span className={`text-xs font-medium ${trend > 0 ? "text-status-safe" : "text-status-danger"}`}>
          {trend > 0 ? "↑" : "↓"}{Math.abs(trend)}
        </span>
      )}
    </div>
  );
}
