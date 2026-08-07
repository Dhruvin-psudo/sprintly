import { Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.55 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}

interface StatsProps {
  data: {
    totalProjects: { value: number; trend: string };
    pendingTasks: { value: number; trend: string };
    completed: { value: number; trend: string };
    teamVelocity: { value: number; trend: string };
  };
}

export function DashboardStats({ data }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total projects</CardTitle>
          <FolderIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.totalProjects.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.totalProjects.trend}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending tasks</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.pendingTasks.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.pendingTasks.trend}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          <CheckCircle2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.completed.value}</div>
          <p className="text-xs text-emerald-500 mt-1">
            {data.completed.trend}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Team velocity</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.teamVelocity.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.teamVelocity.trend}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
