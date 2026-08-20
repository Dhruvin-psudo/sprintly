import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPriorityConfig } from "@/features/task/utils/priority-styles";
import { getStatusConfig } from "@/features/task/utils/status-styles";
import { getFullName, getInitials } from "@/utils/string";
import type { Task, TaskPriority, TaskStatus } from "@/features/task/types";
import { AlertTriangle, CheckCircle2, Clock, ListChecks, Plus, Search } from "lucide-react";

interface ProjectTasksTabProps {
  tasks: Task[];
  onNewTaskClick: () => void;
}

export function ProjectTasksTab({ tasks, onNewTaskClick }: ProjectTasksTabProps) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all");

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

      {/* Filters (No Type filter!) */}
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

      {/* Task List Table (No Type column, No Progress column!) */}
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

                return (
                  <li key={t.id} className="p-4">
                    <p className={`text-sm font-medium ${t.status === "COMPLETED" ? "text-muted-foreground line-through" : ""}`}>
                      {t.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={`text-xs ${priorityCfg.badgeClassName}`}>{priorityCfg.label}</Badge>
                      <Badge variant="outline" className={`text-xs ${statusCfg.badgeClassName}`}>{statusCfg.label}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs min-w-0">
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
                  </tr>
                </thead>
                <tbody>
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

                    return (
                      <tr key={t.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <p className={`font-medium ${t.status === "COMPLETED" ? "text-muted-foreground line-through" : ""}`}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
