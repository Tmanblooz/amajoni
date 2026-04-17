import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { RiskTrendPoint } from "@/hooks/useAmajoniApi";

interface RiskTrendChartProps {
  data: RiskTrendPoint[];
  currentScore: number;
}

export function RiskTrendChart({ data, currentScore }: RiskTrendChartProps) {
  const formatted = data.map(d => ({
    time: new Date(d.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    score: d.score,
  }));

  const first = data[0]?.score ?? currentScore;
  const last = data[data.length - 1]?.score ?? currentScore;
  const delta = last - first;
  const trendUp = delta > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Risk Score Trend</h3>
          <p className="text-xs text-muted-foreground">Last 24 data points</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? "text-status-danger" : "text-status-safe"}`}>
          {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {trendUp ? "+" : ""}{delta}
        </div>
      </div>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <AreaChart data={formatted} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <ReferenceLine y={70} stroke="hsl(var(--status-danger))" strokeDasharray="3 3" label={{ value: "High risk", fontSize: 10, fill: "hsl(var(--status-danger))", position: "right" }} />
            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#riskGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
