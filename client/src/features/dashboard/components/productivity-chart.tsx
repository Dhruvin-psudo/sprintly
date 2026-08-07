import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProductivityChartProps {
  data: { day: string; created: number; completed: number }[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <Card className="lg:col-span-2 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Productivity this week</CardTitle>
          <CardDescription>Tasks created vs completed</CardDescription>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
          Last 7 days
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.68 0.2 300)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.68 0.2 300)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.78 0.16 310)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.78 0.16 310)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
              itemStyle={{ color: "var(--color-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="oklch(0.68 0.2 300)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCreated)"
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="oklch(0.78 0.16 310)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompleted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
