import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getProjectStatusConfig } from "../../utils/project-status-style";
import { getPriorityConfig } from "@/features/task/utils/priority-styles";
import { getStatusConfig } from "@/features/task/utils/status-styles";
import { useUpdateProject } from "../../hooks/use-update-project";
import { PROJECT_ACTIVITY_FULL } from "../../project-detail-data";
import type { IProjectResponse } from "../../types";
import type { Task } from "@/features/task/types";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  ListChecks,
  Pencil,
  Users,
  X,
} from "lucide-react";

const updateProjectInfoSchema = z
  .object({
    phase: z.string().min(1, "Status is required"),
    priority: z.string().min(1, "Priority is required"),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Due date cannot be earlier than start date",
      path: ["dueDate"],
    }
  );

type UpdateProjectInfoFormValues = z.infer<typeof updateProjectInfoSchema>;

interface ProjectOverviewTabProps {
  project: IProjectResponse;
  tasks: Task[];
}

export function ProjectOverviewTab({ project, tasks }: ProjectOverviewTabProps) {
  const updateProjectMutation = useUpdateProject(project.id);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<UpdateProjectInfoFormValues>({
    resolver: zodResolver(updateProjectInfoSchema),
    defaultValues: {
      phase: project.phase || "ACTIVE",
      priority: project.priority || "MEDIUM",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
    },
  });

  const editPhase = watch("phase");
  const editPriority = watch("priority");
  const editStartDate = watch("startDate");
  const editDueDate = watch("dueDate");

  const handleStartDateChange = (val: string) => {
    setValue("startDate", val, { shouldValidate: true });
    if (editDueDate && val && val > editDueDate) {
      setValue("dueDate", val, { shouldValidate: true });
    }
  };

  const handleDueDateChange = (val: string) => {
    setValue("dueDate", val, { shouldValidate: true });
    if (editStartDate && val && val < editStartDate) {
      setValue("startDate", val, { shouldValidate: true });
    }
  };

  const handleStartEdit = () => {
    reset({
      phase: project.phase || "ACTIVE",
      priority: project.priority || "MEDIUM",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
    });
    setIsEditingInfo(true);
  };

  const handleCancelEdit = () => {
    setIsEditingInfo(false);
  };

  const onSubmit = (data: UpdateProjectInfoFormValues) => {
    updateProjectMutation.mutate(
      {
        phase: data.phase,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setIsEditingInfo(false);
        },
      }
    );
  };

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
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 id="project-info-heading" className="text-lg font-semibold tracking-tight">Project information</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Key details and current progress.</p>
            </div>
            {!isEditingInfo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    onClick={handleStartEdit}
                    className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Pencil className="size-4" />
                    <span className="sr-only">Edit project information</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Edit information</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex-1 space-y-4 text-sm">
            {/* Status / Phase */}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Status</dt>
              {isEditingInfo ? (
                <Select value={editPhase} onValueChange={(val) => { if (val) setValue("phase", val, { shouldValidate: true }); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue>{getProjectStatusConfig(editPhase).label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <dd>
                  <Badge variant="outline" className={statusConfig.statusColor}>
                    {statusConfig.label}
                  </Badge>
                </dd>
              )}
            </div>

            {/* Project Code (Read Only) */}
            <div>
              <dt className="text-xs text-muted-foreground">Project Code</dt>
              <dd className="mt-1 font-mono text-sm font-medium">
                {project.code || "—"}
              </dd>
            </div>

            {/* Priority */}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Priority</dt>
              {isEditingInfo ? (
                <Select value={editPriority} onValueChange={(val) => { if (val) setValue("priority", val, { shouldValidate: true }); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue>{editPriority}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">LOW</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="URGENT">URGENT</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <dd>
                  {project.priority ? (
                    <Badge variant="outline">{project.priority}</Badge>
                  ) : (
                    <span className="text-muted-foreground font-normal">—</span>
                  )}
                </dd>
              )}
            </div>

            {/* Start Date */}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Start date</dt>
              {isEditingInfo ? (
                <Input
                  type="date"
                  value={editStartDate}
                  max={editDueDate || undefined}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="h-8 text-xs"
                />
              ) : (
                <dd className="text-sm font-medium">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                    : <span className="text-muted-foreground font-normal">—</span>}
                </dd>
              )}
            </div>

            {/* Due Date */}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Due date</dt>
              {isEditingInfo ? (
                <Input
                  type="date"
                  value={editDueDate}
                  min={editStartDate || undefined}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="h-8 text-xs"
                />
              ) : (
                <dd className="text-sm font-medium">
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                    : <span className="text-muted-foreground font-normal">—</span>}
                </dd>
              )}
            </div>

            {/* Save / Cancel Buttons when Editing */}
            {isEditingInfo && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateProjectMutation.isPending}
                  className="h-8 text-xs flex-1"
                >
                  <X className="size-3.5 mr-1" /> Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateProjectMutation.isPending}
                  className="h-8 text-xs flex-1 bg-gradient-brand text-white hover:opacity-90"
                >
                  <Check className="size-3.5 mr-1" /> {updateProjectMutation.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            )}

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Overall Progress</span>
                <span className="tabular-nums font-medium text-foreground">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-1.5" />
            </div>
          </form>
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
