import { Clock, CheckCircle2, TrendingUp, Folder } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStatsData } from "../types";

interface StatsProps {
  data?: DashboardStatsData;
}

export function DashboardStats({ data }: StatsProps) {
  const stats = data || {
    totalProjects: { value: 0, trend: "0 total in workspace" },
    pendingProjects: { value: 0, trend: "0 active / planning" },
    completedProjects: { value: 0, trend: "0 delivered" },
    projectVelocity: { value: 0, trend: "% completed rate" },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total projects</CardTitle>
          <Folder className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalProjects.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalProjects.trend}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending projects</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.pendingProjects.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingProjects.trend}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed projects</CardTitle>
          <CheckCircle2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.completedProjects.value}</div>
          <p className="text-xs text-emerald-500 mt-1">
            {stats.completedProjects.trend}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Project velocity</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.projectVelocity.value}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.projectVelocity.trend}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

