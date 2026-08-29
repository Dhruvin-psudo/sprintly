import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPriorityConfig } from "@/features/task/utils/priority-styles";
import { getStatusConfig } from "@/features/task/utils/status-styles";
import type { Task, TaskPriority, TaskStatus } from "@/features/task/types";
import { CalendarDays, X } from "lucide-react";

interface CalendarDeadlinesPanelProps {
    selectedDate: string | null;
    selectedDateFormatted: string | null;
    panelTasks: Task[];
    onClearDate: () => void;
}

export function CalendarDeadlinesPanel({
    selectedDate,
    selectedDateFormatted,
    panelTasks,
    onClearDate,
}: CalendarDeadlinesPanelProps) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between gap-2 border-b pb-3">
                <div>
                    <h3 className="font-semibold text-sm">
                        {selectedDate ? `Tasks for ${selectedDateFormatted}` : "Upcoming deadlines"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedDate
                            ? `${panelTasks.length} task${panelTasks.length === 1 ? "" : "s"} scheduled for this date`
                            : "Active tasks sorted by due date"}
                    </p>
                </div>
                {selectedDate && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClearDate}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Clear date selection"
                    >
                        <X className="size-4" />
                        <span className="sr-only">Clear date filter</span>
                    </Button>
                )}
            </div>

            {panelTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                    <CalendarDays className="size-6 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-foreground">No tasks found</p>
                    <p className="mt-1">
                        {selectedDate
                            ? "No tasks are scheduled for this date."
                            : "No active upcoming task deadlines."}
                    </p>
                    {selectedDate && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearDate}
                            className="mt-3 text-xs cursor-pointer"
                        >
                            Show all upcoming
                        </Button>
                    )}
                </div>
            ) : (
                <ul className="mt-4 divide-y divide-border/60 space-y-1 max-h-110 overflow-y-auto pr-1">
                    {panelTasks.map((t) => {
                        const priorityCfg = getPriorityConfig(t.priority as TaskPriority);
                        const statusCfg = getStatusConfig(t.status as TaskStatus);
                        const projectName = t.project?.code || t.project?.name || "Project";
                        const dueDateFormatted = t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                              })
                            : "No date";

                        return (
                            <li key={t.id} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium wrap-break-word leading-snug">{t.title}</p>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground/80 bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                        {projectName}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px]">
                                        <CalendarDays className="size-3" /> {dueDateFormatted}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
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
            )}
        </div>
    );
}
