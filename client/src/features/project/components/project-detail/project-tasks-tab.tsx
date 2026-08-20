import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getPriorityConfig } from "@/features/task/utils/priority-styles";
import { getStatusConfig } from "@/features/task/utils/status-styles";
import { getFullName, getInitials } from "@/utils/string";
import { useUpdateTask } from "@/features/task/hooks/useUpdateTask";
import { useDeleteTask } from "@/features/task/hooks/useDeleteTask";
import { CompletionModal } from "@/features/task/components/completion-modal";
import { DeleteTaskConfirmDialog } from "@/features/project/components/project-detail/delete-task-confirm-dialog";
import { ProjectTasksSkeleton } from "@/features/project/components/project-detail/project-detail-skeleton";
import type { Task, TaskPriority, TaskStatus } from "@/features/task/types";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const updateTaskInlineSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DUE", "COMPLETED"]),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type UpdateTaskInlineFormValues = z.infer<typeof updateTaskInlineSchema>;

interface ProjectTasksTabProps {
  projectId: string;
  tasks: Task[];
  onNewTaskClick: () => void;
  isLoading?: boolean;
}

export function ProjectTasksTab({ projectId, tasks, onNewTaskClick, isLoading }: ProjectTasksTabProps) {
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  if (isLoading) {
    return <ProjectTasksSkeleton />;
  }

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all");

  // State for modals
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Editing state for inline task row
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    register,
  } = useForm<UpdateTaskInlineFormValues>({
    resolver: zodResolver(updateTaskInlineSchema),
    defaultValues: {
      title: "",
      priority: "MEDIUM",
      status: "TODO",
      assigneeId: "unassigned",
      dueDate: "",
    },
  });

  const editPriority = watch("priority");
  const editStatus = watch("status");
  const editAssigneeId = watch("assigneeId") || "unassigned";
  const editDueDate = watch("dueDate") || "";

  const assignees = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    for (const t of tasks) {
      if (t.assignee && !seen.has(t.assignee.id)) {
        seen.add(t.assignee.id);
        list.push({
          id: t.assignee.id,
          name: getFullName(t.assignee.firstName, t.assignee.lastName) || t.assignee.email,
        });
      }
    }
    return list;
  }, [tasks]);

  const resetFilters = () => {
    setQ("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setDueFilter("all");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredTasks = tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && t.assigneeId !== assigneeFilter) return false;
    if (dueFilter === "overdue" && (!t.dueDate || t.dueDate >= todayStr || t.status === "COMPLETED")) return false;
    return true;
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue = tasks.filter((t) => t.status !== "COMPLETED" && t.dueDate && t.dueDate < todayStr).length;

  const handleStartEditRow = (task: Task) => {
    setEditingTaskId(task.id);
    reset({
      title: task.title,
      priority: task.priority,
      status: task.status,
      assigneeId: task.assigneeId || "unassigned",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
  };

  const handleCancelEditRow = () => {
    setEditingTaskId(null);
  };

  const onSaveInlineTask = (data: UpdateTaskInlineFormValues) => {
    if (!editingTaskId) return;

    updateTaskMutation.mutate(
      {
        projectId,
        id: editingTaskId,
        data: {
          title: data.title,
          priority: data.priority,
          status: data.status,
          assigneeId: data.assigneeId === "unassigned" ? null : data.assigneeId,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        },
      },
      {
        onSuccess: () => {
          setEditingTaskId(null);
        },
      }
    );
  };

  const handleConfirmComplete = () => {
    if (!taskToComplete) return;
    updateTaskMutation.mutate(
      {
        projectId,
        id: taskToComplete.id,
        data: {
          status: "COMPLETED",
          dueDate: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          setTaskToComplete(null);
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(
      { projectId, id: taskToDelete.id },
      {
        onSuccess: () => {
          setTaskToDelete(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Action header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
          <p className="text-xs text-muted-foreground">Manage and track tasks associated with this project.</p>
        </div>
        <Button onClick={onNewTaskClick} className="bg-gradient-brand text-white hover:opacity-90 shadow-glow">
          <Plus className="size-4 mr-1" aria-hidden /> New task
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total tasks</span>
            <ListChecks className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{total}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{completed}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In progress</span>
            <Clock className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{inProgress}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overdue</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{overdue}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val); }}>
            <SelectTrigger>
              <SelectValue>
                {statusFilter === "all" ? "All statuses" : getStatusConfig(statusFilter as TaskStatus).label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="DUE">Dues</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(val) => { if (val) setPriorityFilter(val); }}>
            <SelectTrigger>
              <SelectValue>
                {priorityFilter === "all" ? "All priorities" : getPriorityConfig(priorityFilter as TaskPriority).label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={(val) => { if (val) setAssigneeFilter(val); }}>
            <SelectTrigger>
              <SelectValue>
                {assigneeFilter === "all" ? "All assignees" : assignees.find((a) => a.id === assigneeFilter)?.name || "Assignee"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dueFilter} onValueChange={(val) => { if (val) setDueFilter(val); }}>
            <SelectTrigger>
              <SelectValue>
                {dueFilter === "all" ? "Any due date" : "Overdue"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any due date</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List Table */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Search className="size-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-sm">No tasks match your criteria</p>
            <p className="text-xs mt-1">Try adjusting filters or create a new task.</p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <ul className="divide-y divide-border/60 lg:hidden">
              {filteredTasks.map((t) => {
                const priorityCfg = getPriorityConfig(t.priority as TaskPriority);
                const statusCfg = getStatusConfig(t.status as TaskStatus);
                const assigneeName = t.assignee
                  ? getFullName(t.assignee.firstName, t.assignee.lastName) || t.assignee.email
                  : "Unassigned";
                const initials = t.assignee
                  ? getInitials(t.assignee.firstName, t.assignee.lastName) || "U"
                  : "U";

                const isOverdue = t.status !== "COMPLETED" && !!t.dueDate && t.dueDate < todayStr;
                const formattedDueDate = t.dueDate
                  ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                  : "No date";
                const isCompleted = t.status === "COMPLETED";

                return (
                  <li key={t.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                        {t.title}
                      </p>
                      {!isCompleted && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-7 text-emerald-600" onClick={() => setTaskToComplete(t)}>
                            <CheckCircle2 className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => handleStartEditRow(t)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setTaskToDelete(t)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={`text-xs ${priorityCfg.badgeClassName}`}>{priorityCfg.label}</Badge>
                      <Badge variant="outline" className={`text-xs ${statusCfg.badgeClassName}`}>{statusCfg.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs min-w-0 pt-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-gradient-brand text-white text-[9px] font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">{assigneeName}</span>
                      </div>
                      <span className={isOverdue ? "text-rose-500 dark:text-rose-400 font-medium" : "text-muted-foreground"}>
                        {formattedDueDate}{isOverdue && " · overdue"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="text-left p-3 font-medium">Task</th>
                    <th scope="col" className="text-left p-3 font-medium">Priority</th>
                    <th scope="col" className="text-left p-3 font-medium">Status</th>
                    <th scope="col" className="text-left p-3 font-medium">Assignee</th>
                    <th scope="col" className="text-left p-3 font-medium whitespace-nowrap">Due date</th>
                    <th scope="col" className="p-3 w-28 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t) => {
                    const isEditingThisRow = editingTaskId === t.id;
                    const priorityCfg = getPriorityConfig(t.priority as TaskPriority);
                    const statusCfg = getStatusConfig(t.status as TaskStatus);
                    const assigneeName = t.assignee
                      ? getFullName(t.assignee.firstName, t.assignee.lastName) || t.assignee.email
                      : "Unassigned";
                    const initials = t.assignee
                      ? getInitials(t.assignee.firstName, t.assignee.lastName) || "U"
                      : "U";

                    const isOverdue = t.status !== "COMPLETED" && !!t.dueDate && t.dueDate < todayStr;
                    const formattedDueDate = t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                      : "No date";
                    const isCompleted = t.status === "COMPLETED";

                    if (isEditingThisRow) {
                      return (
                        <tr key={t.id} className="border-t border-border/60 bg-muted/20">
                          <td className="p-2">
                            <Input
                              {...register("title")}
                              className="h-8 text-xs font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <Select value={editPriority} onValueChange={(val) => { if (val) setValue("priority", val as TaskPriority, { shouldValidate: true }); }}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue>{editPriority}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select value={editStatus} onValueChange={(val) => { if (val) setValue("status", val as TaskStatus, { shouldValidate: true }); }}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue>{getStatusConfig(editStatus).label}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="REVIEW">Review</SelectItem>
                                <SelectItem value="DUE">Dues</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select value={editAssigneeId} onValueChange={(val) => { if (val) setValue("assigneeId", val, { shouldValidate: true }); }}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue>
                                  {editAssigneeId === "unassigned" ? "Unassigned" : assignees.find((a) => a.id === editAssigneeId)?.name || "Assignee"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {assignees.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            {(() => {
                              const taskCreatedDate = t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : todayStr;
                              const minDueDate = isOverdue ? todayStr : (taskCreatedDate > todayStr ? todayStr : taskCreatedDate);
                              return (
                                <Input
                                  type="date"
                                  value={editDueDate}
                                  min={minDueDate}
                                  onChange={(e) => setValue("dueDate", e.target.value, { shouldValidate: true })}
                                  className="h-8 text-xs"
                                />
                              );
                            })()}
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleSubmit(onSaveInlineTask)}
                                disabled={updateTaskMutation.isPending}
                                className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer"
                              >
                                <Check className="size-4" />
                                <span className="sr-only">Save</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancelEditRow}
                                disabled={updateTaskMutation.isPending}
                                className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <X className="size-4" />
                                <span className="sr-only">Cancel</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={t.id} className="group/row border-t border-border/60 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <p className={`font-medium ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                            {t.title}
                          </p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-xs ${priorityCfg.badgeClassName}`}>{priorityCfg.label}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-xs ${statusCfg.badgeClassName}`}>{statusCfg.label}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6 shrink-0">
                              <AvatarFallback className="bg-gradient-brand text-white text-[9px] font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <span>{assigneeName}</span>
                          </div>
                        </td>
                        <td className={`p-3 whitespace-nowrap ${isOverdue ? "text-rose-500 dark:text-rose-400 font-medium" : "text-muted-foreground"}`}>
                          {formattedDueDate}{isOverdue && " · overdue"}
                        </td>
                        <td className="p-3 text-right">
                          {!isCompleted && (
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              {/* Mark as Completed */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger
                                    onClick={() => setTaskToComplete(t)}
                                    className="inline-flex items-center justify-center size-7 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 className="size-4" />
                                    <span className="sr-only">Mark as completed</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Mark as completed</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Edit Task */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger
                                    onClick={() => handleStartEditRow(t)}
                                    className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                                  >
                                    <Pencil className="size-3.5" />
                                    <span className="sr-only">Edit task</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Edit task</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* Delete Task */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger
                                    onClick={() => setTaskToDelete(t)}
                                    className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span className="sr-only">Delete task</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Delete task</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Mark Completed Confirmation Modal */}
      <CompletionModal
        open={!!taskToComplete}
        task={taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onConfirm={handleConfirmComplete}
        isPending={updateTaskMutation.isPending}
      />

      {/* Delete Task Confirmation Modal */}
      <DeleteTaskConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
        taskTitle={taskToDelete?.title || ""}
        onConfirm={handleConfirmDelete}
        isPending={deleteTaskMutation.isPending}
      />
    </div>
  );
}
