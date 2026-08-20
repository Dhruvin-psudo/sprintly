import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProjectStatusConfig } from "../../utils/project-status-style";
import { getPriorityConfig } from "@/features/task/utils/priority-styles";
import { getStatusConfig } from "@/features/task/utils/status-styles";
import { PROJECT_ACTIVITY_FULL } from "../../project-detail-data";
import type { IProjectResponse } from "../../types";
import type { Task } from "@/features/task/types";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListChecks,
  Users,
} from "lucide-react";

interface ProjectOverviewTabProps {
  project: IProjectResponse;
  tasks: Task[];
}

export function ProjectOverviewTab({ project, tasks }: ProjectOverviewTabProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  const now = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.dueDate && t.dueDate < now).length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress ?? 0);
  const memberCount = project.members?.length || project._count?.members || 1;

  const upcomingTasks = tasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 8);

  const statusConfig = getProjectStatusConfig(project.phase);

  const stats = [
    { label: "Total tasks", value: totalTasks, hint: "in project", icon: ListChecks },
    { label: "Completed", value: completedTasks, hint: "done tasks", icon: CheckCircle2 },
    { label: "In progress", value: inProgressTasks, hint: "active now", icon: Clock },
    { label: "Overdue", value: overdueTasks, hint: "needs attention", icon: AlertTriangle },
    { label: "Team members", value: memberCount, hint: "project collaborators", icon: Users },
    { label: "Completion", value: `${completionPercent}%`, hint: "tasks completed", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Parallel Columns of Equal Width */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 items-stretch">
        {/* Column 1: Project Information */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col" aria-labelledby="project-info-heading">
          <h2 id="project-info-heading" className="text-lg font-semibold tracking-tight">Project information</h2>
          <p className="mt-1 text-xs text-muted-foreground">Key details and current progress.</p>
          
          <div className="mt-4 flex-1 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <Badge variant="outline" className={statusConfig.statusColor}>
                  {statusConfig.label}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Project Code</dt>
              <dd className="mt-1 font-mono text-sm font-medium">
                {project.code || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Priority</dt>
              <dd className="mt-1">
                {project.priority ? (
                  <Badge variant="outline">{project.priority}</Badge>
                ) : (
                  <span className="text-muted-foreground font-normal">—</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Start date</dt>
              <dd className="mt-1 text-sm font-medium">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                  : <span className="text-muted-foreground font-normal">—</span>}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Due date</dt>
              <dd className="mt-1 text-sm font-medium">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                  : <span className="text-muted-foreground font-normal">—</span>}
              </dd>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Overall Progress</span>
                <span className="tabular-nums font-medium text-foreground">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-1.5" />
            </div>
          </div>
        </section>

        {/* Column 2: Upcoming Deadlines with Inline Scrolling */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col" aria-labelledby="deadlines-heading">
          <h2 id="deadlines-heading" className="text-lg font-semibold tracking-tight">Upcoming deadlines</h2>
          <p className="mt-1 text-xs text-muted-foreground">Next tasks due in this project.</p>

          <div className="mt-4 flex-1">
            {upcomingTasks.length === 0 ? (
              <div className="h-full grid place-items-center text-center p-6 text-muted-foreground text-xs">
                <div>
                  <CalendarDays className="size-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming deadlines</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[360px] pr-3">
                <ul className="divide-y divide-border/60 space-y-1">
                  {upcomingTasks.map((t) => {
                    const priorityCfg = getPriorityConfig(t.priority);
                    const statusCfg = getStatusConfig(t.status);
                    const formattedDue = t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                      : "No date";

                    return (
                      <li key={t.id} className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-medium break-words">{t.title}</p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="size-3" aria-hidden /> {formattedDue}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${priorityCfg.badgeClassName}`}>
                            {priorityCfg.label}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${statusCfg.badgeClassName}`}>
                            {statusCfg.label}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>
        </section>

        {/* Column 3: Recent Activity with Inline Scrolling */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-lg font-semibold tracking-tight">Recent activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest events and changes in project.</p>

          <div className="mt-4 flex-1">
            <ScrollArea className="h-[360px] pr-3">
              <ol className="relative border-l border-border/60 ml-3.5 space-y-5 py-1">
                {PROJECT_ACTIVITY_FULL.slice(0, 8).map((a) => (
                  <li key={a.id} className="pl-5 relative">
                    <Avatar className="size-6 absolute -left-[13px] top-0 ring-2 ring-card">
                      <AvatarFallback className="bg-gradient-brand text-white text-[9px] font-bold">
                        {a.initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs break-words">
                      <span className="font-medium">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                      {a.object && <span className="font-medium"> {a.object}</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.when}</p>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </div>
        </section>
      </div>
    </div>
  );
}
