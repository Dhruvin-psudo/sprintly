import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTasks } from "@/features/task/hooks/useMyTasks";
import type { Task } from "@/features/task/types";
import { CalendarDays } from "lucide-react";
import { formatDateKey, getCalendarCells, getLocalDateKey } from "./utils/calendar-utils";
import { CalendarHeader } from "./components/calendar-header";
import { CalendarMonthGrid } from "./components/calendar-month-grid";
import { CalendarDeadlinesPanel } from "./components/calendar-deadlines-panel";

function CalendarSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between border-b pb-5">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-44" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="size-9" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="size-9" />
                    <Skeleton className="h-9 w-16" />
                </div>
            </div>
            <div className="grid gap-4 items-start xl:grid-cols-[minmax(0,1fr)_340px]">
                <Skeleton className="h-130 rounded-2xl" />
                <Skeleton className="h-130 rounded-2xl" />
            </div>
        </div>
    );
}

export function CalendarContainer() {
    const { data: tasksResponse, isLoading, isError, refetch } = useMyTasks({
        limit: 500,
        sortBy: "dueDate",
        sortOrder: "asc",
    });

    const tasks: Task[] = useMemo(
        () => (tasksResponse?.data ? Array.from(tasksResponse.data) : []),
        [tasksResponse]
    );

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const cells = useMemo(() => getCalendarCells(currentMonth), [currentMonth]);
    const monthLabel = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
    const todayKey = formatDateKey(new Date());

    const handleCellClick = (dateKey: string) => {
        setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
    };

    const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null;
    const selectedDateFormatted = selectedDateObj
        ? selectedDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;

    const panelTasks = useMemo(() => {
        if (selectedDate) {
            return tasks.filter((t) => t.dueDate && getLocalDateKey(t.dueDate) === selectedDate);
        }
        return tasks
            .filter((t) => t.status !== "COMPLETED" && t.dueDate)
            .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
            .slice(0, 10);
    }, [tasks, selectedDate]);

    if (isLoading) {
        return <CalendarSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="border-b pb-5">
                    <h1 className="text-2xl font-bold tracking-tight">App Calendar</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View deadlines across all projects you are a member of. Click any date cell to filter tasks.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
                    <CalendarDays className="size-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground">Failed to load calendar tasks</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Something went wrong while fetching your tasks. Please try again.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="mt-4 cursor-pointer"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
            <CalendarHeader
                title="App Calendar"
                description="View deadlines across all projects you are a member of. Click any date cell to filter tasks."
                monthLabel={monthLabel}
                onPrevMonth={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                }
                onNextMonth={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                }
                onToday={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(todayKey);
                }}
            />

            <div className="grid gap-4 items-start xl:grid-cols-[minmax(0,1fr)_360px]">
                <CalendarMonthGrid
                    cells={cells}
                    tasks={tasks}
                    todayKey={todayKey}
                    selectedDate={selectedDate}
                    onCellClick={handleCellClick}
                />

                <CalendarDeadlinesPanel
                    selectedDate={selectedDate}
                    selectedDateFormatted={selectedDateFormatted}
                    panelTasks={panelTasks}
                    onClearDate={() => setSelectedDate(null)}
                />
            </div>
        </div>
    );
}
