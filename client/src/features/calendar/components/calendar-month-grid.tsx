import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Task } from "@/features/task/types";
import { WEEKDAYS, STATUS_DOT_COLOR, formatDateKey, getLocalDateKey } from "../utils/calendar-utils";
import { CalendarStatusLegend } from "./calendar-status-legend";

interface CalendarMonthGridProps {
    cells: (Date | null)[];
    tasks: Task[];
    todayKey: string;
    selectedDate?: string | null;
    onCellClick?: (dateKey: string) => void;
}

export function CalendarMonthGrid({
    cells,
    tasks,
    todayKey,
    selectedDate,
    onCellClick,
}: CalendarMonthGridProps) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        className="text-[11px] sm:text-xs font-semibold text-muted-foreground text-center py-1"
                    >
                        {d}
                    </div>
                ))}
                {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="min-h-16 sm:min-h-24 rounded-xl" />;
                    const dateKey = formatDateKey(day);
                    const dayTasks = tasks.filter((t) => t.dueDate && getLocalDateKey(t.dueDate) === dateKey);
                    const isToday = dateKey === todayKey;
                    const isSelected = selectedDate === dateKey;

                    return (
                        <Button
                            key={dateKey}
                            variant="ghost"
                            type="button"
                            onClick={() => onCellClick?.(dateKey)}
                            disabled={!onCellClick}
                            className={cn(
                                "h-auto min-h-16 sm:min-h-24 rounded-xl border p-1.5 sm:p-2 transition-all text-left flex flex-col items-stretch justify-start font-normal",
                                onCellClick ? "cursor-pointer" : "cursor-default",
                                isSelected
                                    ? "ring-2 ring-primary border-primary bg-primary/10 hover:bg-primary/15 shadow-sm"
                                    : isToday
                                        ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                                        : "border-border/40 bg-muted/20 hover:bg-muted/40",
                            )}
                        >
                            <div className="flex items-center justify-between w-full">
                                <p
                                    className={cn(
                                        "text-[11px] sm:text-xs font-semibold",
                                        isSelected
                                            ? "text-primary font-bold"
                                            : isToday
                                                ? "text-primary"
                                                : "text-muted-foreground",
                                    )}
                                >
                                    {day.getDate()}
                                </p>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1 rounded">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 space-y-1 w-full">
                                {dayTasks.slice(0, 2).map((t) => (
                                    <div
                                        key={t.id}
                                        className="hidden sm:flex items-center gap-1.5 rounded-lg bg-card border border-border/60 px-1.5 py-0.5"
                                    >
                                        <span
                                            className={cn(
                                                "size-1.5 rounded-full shrink-0",
                                                STATUS_DOT_COLOR[t.status] || "bg-primary",
                                            )}
                                        />
                                        <span className="text-[10px] truncate font-medium">{t.title}</span>
                                    </div>
                                ))}
                                <div className="flex sm:hidden gap-1 flex-wrap">
                                    {dayTasks.slice(0, 3).map((t) => (
                                        <span
                                            key={t.id}
                                            className={cn(
                                                "size-1.5 rounded-full",
                                                STATUS_DOT_COLOR[t.status] || "bg-primary",
                                            )}
                                        />
                                    ))}
                                </div>
                                {dayTasks.length > 2 && (
                                    <p className="hidden sm:block text-[10px] text-muted-foreground">
                                        +{dayTasks.length - 2} more
                                    </p>
                                )}
                            </div>
                        </Button>
                    );
                })}
            </div>

            {/* Status legend */}
            <CalendarStatusLegend className="mt-4 pt-3 border-t border-border/60" />
        </div>
    );
}
