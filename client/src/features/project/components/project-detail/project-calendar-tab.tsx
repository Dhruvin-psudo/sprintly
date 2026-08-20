import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getPriorityConfig } from "@/features/task/utils/priority-styles";
import { getStatusConfig } from "@/features/task/utils/status-styles";
import { useUpdateTask } from "@/features/task/hooks/useUpdateTask";
import { ProjectCalendarSkeleton } from "@/features/project/components/project-detail/project-detail-skeleton";
import type { Task, TaskPriority, TaskStatus } from "@/features/task/types";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";

interface ProjectCalendarTabProps {
  projectId: string;
  tasks: Task[];
  isLoading?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dotColor: Record<string, string> = {
  COMPLETED: "bg-emerald-500",
  IN_PROGRESS: "bg-blue-500",
  TODO: "bg-violet-500",
  REVIEW: "bg-amber-500",
  DUE: "bg-rose-500",
};

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ProjectCalendarTab({ projectId, tasks, isLoading }: ProjectCalendarTabProps) {
  const updateTaskMutation = useUpdateTask();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Inline editing state for List view
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState<string>("");

  if (isLoading) {
    return <ProjectCalendarSkeleton />;
  }

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayKey = formatDateKey(new Date());

  const upcoming = tasks
    .filter((t) => t.status !== "COMPLETED" && t.dueDate)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 8);

  const handleStartEditDate = (t: Task) => {
    setEditingTaskId(t.id);
    setEditingDueDate(t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "");
  };

  const handleSaveDueDate = (taskId: string) => {
    if (!editingDueDate) return;
    updateTaskMutation.mutate(
      {
        projectId,
        id: taskId,
        data: {
          dueDate: new Date(editingDueDate).toISOString(),
        },
      },
      {
        onSuccess: () => {
          setEditingTaskId(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Task calendar</h2>
          <p className="text-xs text-muted-foreground">Deadlines for this project, month by month.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="text-sm font-medium min-w-[130px] text-center">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>
      </div>

      <Tabs defaultValue="month">
        <TabsList aria-label="Calendar view">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          <div className="grid gap-4 items-start xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Month Grid */}
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-[11px] sm:text-xs font-semibold text-muted-foreground text-center py-1">
                    {d}
                  </div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="min-h-16 sm:min-h-24 rounded-xl" />;
                  const dateKey = formatDateKey(day);
                  const dayTasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateKey));
                  const isToday = dateKey === todayKey;

                  return (
                    <div
                      key={dateKey}
                      className={`min-h-16 sm:min-h-24 rounded-xl border p-1.5 sm:p-2 transition-colors hover:bg-muted/30 ${
                        isToday ? "border-primary/50 bg-primary/5" : "border-border/40 bg-muted/20"
                      }`}
                    >
                      <p className={`text-[11px] sm:text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {day.getDate()}
                      </p>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div key={t.id} className="hidden sm:flex items-center gap-1.5 rounded-lg bg-card border border-border/60 px-1.5 py-1">
                            <span className={`size-1.5 rounded-full shrink-0 ${dotColor[t.status] || "bg-primary"}`} />
                            <span className="text-[10px] truncate">{t.title}</span>
                          </div>
                        ))}
                        <div className="flex sm:hidden gap-1">
                          {dayTasks.slice(0, 3).map((t) => (
                            <span key={t.id} className={`size-1.5 rounded-full ${dotColor[t.status] || "bg-primary"}`} />
                          ))}
                        </div>
                        {dayTasks.length > 2 && (
                          <p className="hidden sm:block text-[10px] text-muted-foreground">+{dayTasks.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Completed</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> In Progress</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet-500" /> To Do</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Review</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> Dues</span>
              </div>
            </div>

            {/* Upcoming Panel */}
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="font-semibold text-sm">Upcoming deadlines</h3>
              <p className="text-xs text-muted-foreground">Active tasks sorted by due date</p>
              {upcoming.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <CalendarDays className="size-6 mx-auto mb-2 opacity-50" />
                  <p>No upcoming task deadlines</p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border/60 space-y-1">
                  {upcoming.map((t) => {
                    const priorityCfg = getPriorityConfig(t.priority as TaskPriority);
                    const statusCfg = getStatusConfig(t.status as TaskStatus);
                    return (
                      <li key={t.id} className="py-2.5 first:pt-0 last:pb-0">
                        <p className="text-sm font-medium break-words">{t.title}</p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3" /> {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${priorityCfg.badgeClassName}`}>{priorityCfg.label}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${statusCfg.badgeClassName}`}>{statusCfg.label}</Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </TabsContent>

        {/* List View with Inline Due Date Edit */}
        <TabsContent value="list" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="text-left p-3 font-medium">Task</th>
                    <th scope="col" className="text-left p-3 font-medium whitespace-nowrap">Due date</th>
                    <th scope="col" className="text-left p-3 font-medium">Priority</th>
                    <th scope="col" className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((t) => t.dueDate)
                    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
                    .map((t) => {
                      const priorityCfg = getPriorityConfig(t.priority as TaskPriority);
                      const statusCfg = getStatusConfig(t.status as TaskStatus);
                      const isEditingThisDate = editingTaskId === t.id;
                      const isCompleted = t.status === "COMPLETED";
                      const taskCreatedDate = t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : todayKey;
                      const isOverdueOrDue = !isCompleted && !!t.dueDate && t.dueDate < todayKey;
                      const minDueDateStr = isOverdueOrDue ? todayKey : (taskCreatedDate > todayKey ? todayKey : taskCreatedDate);

                      return (
                        <tr key={t.id} className="group/listrow border-t border-border/60 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{t.title}</td>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            {isEditingThisDate ? (
                              <div className="flex items-center gap-1.5">
                                <Input
                                  type="date"
                                  min={minDueDateStr}
                                  value={editingDueDate}
                                  onChange={(e) => setEditingDueDate(e.target.value)}
                                  className="h-7 text-xs w-36"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSaveDueDate(t.id)}
                                  disabled={updateTaskMutation.isPending}
                                  className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer"
                                >
                                  <Check className="size-3.5" />
                                  <span className="sr-only">Save due date</span>
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingTaskId(null)}
                                  disabled={updateTaskMutation.isPending}
                                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  <X className="size-3.5" />
                                  <span className="sr-only">Cancel</span>
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
                                {!isCompleted && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger
                                        onClick={() => handleStartEditDate(t)}
                                        className="inline-flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover/listrow:opacity-100 transition-opacity cursor-pointer"
                                      >
                                        <Pencil className="size-3" />
                                        <span className="sr-only">Edit due date</span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Edit due date</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3"><Badge variant="outline" className={`text-xs ${priorityCfg.badgeClassName}`}>{priorityCfg.label}</Badge></td>
                          <td className="p-3"><Badge variant="outline" className={`text-xs ${statusCfg.badgeClassName}`}>{statusCfg.label}</Badge></td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
