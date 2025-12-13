import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TrendChartProps {
  data: { name: string; value: number }[];
  color?: "safe" | "warning" | "danger" | "accent";
  height?: number;
}

export function TrendChart({ data, color = "accent", height = 120 }: TrendChartProps) {
  const colorMap = useMemo(() => ({
    safe: "hsl(160, 84%, 39%)",
    warning: "hsl(38, 92%, 50%)",
    danger: "hsl(347, 77%, 50%)",
    accent: "hsl(239, 84%, 67%)",
  }), []);

  const gradientId = `gradient-${color}`;
  const strokeColor = colorMap[color];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ 
            background: "hsl(222, 47%, 14%)", 
            border: "1px solid hsl(222, 47%, 22%)",
            borderRadius: "8px",
            fontSize: "12px"
          }}
          labelStyle={{ color: "hsl(210, 40%, 98%)" }}
          itemStyle={{ color: strokeColor }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={strokeColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
