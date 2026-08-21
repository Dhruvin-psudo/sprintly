import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ICompletionByProject } from "../types";

interface ProjectCompletionChartProps {
  data?: ICompletionByProject[];
}

export function ProjectCompletionChart({ data = [] }: ProjectCompletionChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Completion by project</CardTitle>
        <CardDescription>Tasks done vs remaining</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-sm">
            No project data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
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
                cursor={{ fill: "transparent" }}
                contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
              />
              <Bar dataKey="done" stackId="a" fill="oklch(0.68 0.2 300)" radius={[0, 0, 4, 4]} barSize={32} />
              <Bar dataKey="remaining" stackId="a" fill="oklch(0.24 0.015 285)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

