import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
    title?: string;
    description?: string;
    headingLevel?: "h1" | "h2";
    monthLabel: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export function CalendarHeader({
    title,
    description,
    headingLevel = "h1",
    monthLabel,
    onPrevMonth,
    onNextMonth,
    onToday,
}: CalendarHeaderProps) {
    const HeadingTag = headingLevel;
    const headingStyles = headingLevel === "h2" ? "text-lg font-semibold tracking-tight" : "text-2xl font-bold tracking-tight";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
            <div>
                {title && <HeadingTag className={headingStyles}>{title}</HeadingTag>}
                {description && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button variant="outline" size="icon" onClick={onPrevMonth} className="cursor-pointer" aria-label="Previous month">
                    <ChevronLeft className="size-4" aria-hidden />
                </Button>
                <span className="text-sm font-semibold min-w-32.5 text-center">{monthLabel}</span>
                <Button variant="outline" size="icon" onClick={onNextMonth} className="cursor-pointer" aria-label="Next month">
                    <ChevronRight className="size-4" aria-hidden />
                </Button>
                <Button variant="outline" size="sm" onClick={onToday} className="cursor-pointer">
                    Today
                </Button>
            </div>
        </div>
    );
}
