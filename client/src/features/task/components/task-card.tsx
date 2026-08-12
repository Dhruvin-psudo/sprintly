import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { Task } from '../types';
import { getPriorityConfig } from '../utils/priority-styles';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export function TaskCard({ task, onEdit, onDragStart }: TaskCardProps) {
    const { data: user } = useCurrentUser();
    const currentUserId = user?.id;
    const isCompleted = task.status === 'COMPLETED';
    const isAssignedToCurrentUser = !!(task.assigneeId && currentUserId && task.assigneeId === currentUserId);

    const priorityConfig = getPriorityConfig(task.priority);
    const projectCode = task.project?.code || 'PRJ';

    const formattedDate = task.dueDate
        ? format(new Date(task.dueDate), 'MMM dd')
        : null;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (isCompleted) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, fromStatus: task.status }));
        if (onDragStart) {
            onDragStart(e, task);
        }
    };

    return (
        <Card
            draggable={!isCompleted}
            onDragStart={handleDragStart}
            onClick={() => !isCompleted && onEdit?.(task)}
            className={cn(
                "rounded-xl bg-card p-3 transition-all duration-200 ring-0",
                isCompleted
                    ? "border border-dashed border-border/60 bg-muted/30 opacity-65 cursor-not-allowed"
                    : "border border-border/70 hover:border-primary/50 shadow-2xs hover:shadow-xs cursor-grab active:cursor-grabbing"
            )}
        >
            <CardContent className="p-1.5 space-y-2">
                {/* Title */}
                <h4 className={cn(
                    "font-medium text-sm leading-snug line-clamp-2",
                    isCompleted && "line-through text-muted-foreground"
                )}>
                    {task.title}
                </h4>

                {/* Priority Badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-[10px]",
                            priorityConfig.badgeClassName
                        )}
                    >
                        {priorityConfig.label}
                    </Badge>
                </div>

                {/* Bottom Row: Project Code, Due Date, Purple Avatar */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 min-w-0">
                    <div className="flex items-center gap-4 min-w-0 overflow-hidden">
                        {/* Project Code */}
                        <span className="font-semibold text-[10px] tracking-wider text-muted-foreground">
                            {projectCode}
                        </span>

                        {/* Due Date */}
                        {formattedDate && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground shrink-0">
                                <Calendar className="size-3 text-muted-foreground/70" />
                                {formattedDate}
                            </span>
                        )}
                    </div>

                    {/* Small Purple Avatar (No Text/Initials) — ONLY shown if assigned to current logged in user */}
                    {isAssignedToCurrentUser && (
                        <div
                            title="Assigned to you"
                            className="size-4 rounded-full bg-purple-600 dark:bg-purple-500 shrink-0 border border-purple-300 dark:border-purple-700 shadow-sm ml-1"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
