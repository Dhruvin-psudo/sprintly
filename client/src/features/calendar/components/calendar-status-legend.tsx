import { cn } from "@/lib/utils";

interface CalendarStatusLegendProps {
    className?: string;
}

export function CalendarStatusLegend({ className }: CalendarStatusLegendProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-4 text-xs text-muted-foreground", className)}>
            <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet-500" /> To Do
            </span>
            <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500" /> Review
            </span>
            <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500" /> Dues
            </span>
        </div>
    );
}
