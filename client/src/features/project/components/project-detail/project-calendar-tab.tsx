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
import { CalendarDays, Check, Pencil, X } from "lucide-react";
import { formatDateKey, getCalendarCells } from "@/features/calendar/utils/calendar-utils";
import { CalendarHeader } from "@/features/calendar/components/calendar-header";
import { CalendarMonthGrid } from "@/features/calendar/components/calendar-month-grid";

interface ProjectCalendarTabProps {
  projectId: string;
  tasks: Task[];
  isLoading?: boolean;
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

  const cells = getCalendarCells(currentMonth);
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
      <CalendarHeader
        title="Task calendar"
        description="Deadlines for this project, month by month."
        headingLevel="h2"
        monthLabel={monthLabel}
        onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
        onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
        onToday={() => setCurrentMonth(new Date())}
      />

      <Tabs defaultValue="month">
        <TabsList aria-label="Calendar view">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          <div className="grid gap-4 items-start xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Month Grid */}
            <CalendarMonthGrid
              cells={cells}
              tasks={tasks}
              todayKey={todayKey}
            />

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
                        <p className="text-sm font-medium wrap-break-word">{t.title}</p>
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
                                      <TooltipTrigger >
                                        <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => handleStartEditDate(t)}
                                          className="size-6 text-muted-foreground hover:text-foreground opacity-0 group-hover/listrow:opacity-100 transition-opacity cursor-pointer"
                                        >
                                          <Pencil className="size-3" />
                                          <span className="sr-only">Edit due date</span>
                                        </Button>
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
