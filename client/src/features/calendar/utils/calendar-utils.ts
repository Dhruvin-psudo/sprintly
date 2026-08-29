export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const STATUS_DOT_COLOR: Record<string, string> = {
    COMPLETED: "bg-emerald-500",
    IN_PROGRESS: "bg-blue-500",
    TODO: "bg-violet-500",
    REVIEW: "bg-amber-500",
    DUE: "bg-rose-500",
};

export function formatDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getLocalDateKey(dateInput: string | Date): string {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getCalendarCells(currentMonth: Date): (Date | null)[] {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const offset = (firstDay.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    const cells: (Date | null)[] = [
        ...Array.from({ length: offset }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}
