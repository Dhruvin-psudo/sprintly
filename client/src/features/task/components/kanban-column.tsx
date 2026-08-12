import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { TaskCard } from './task-card';
import type { Task, TaskStatus } from '../types';
import { getStatusConfig } from '../utils/status-styles';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
    status: TaskStatus;
    title?: string;
    tasks: Task[];
    onAddTask?: (status: TaskStatus) => void;
    onEditTask?: (task: Task) => void;
    onDropTask?: (taskId: string, targetStatus: TaskStatus, fromStatus: TaskStatus) => void;
}

export function KanbanColumn({
    status,
    title,
    tasks,
    onAddTask,
    onEditTask,
    onDropTask,
}: KanbanColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const statusConfig = getStatusConfig(status);

    const isCompleted = status === 'COMPLETED';
    const isDues = status === 'DUE';
    // User rule: Do not allow + button in Dues or Completed header
    const canAddTask = !isCompleted && !isDues && !!onAddTask;

    const columnTitle = title || statusConfig.label;
    const IconComponent = statusConfig.icon;

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const rawData = e.dataTransfer.getData('text/plain');
            if (!rawData) return;
            const { taskId, fromStatus } = JSON.parse(rawData);
            if (taskId && onDropTask) {
                onDropTask(taskId, status, fromStatus);
            }
        } catch (err) {
            console.error('Failed to parse drag drop payload:', err);
        }
    };

    const needsScroll = tasks.length > 8;

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col h-full w-full flex-1 min-w-0 rounded-2xl p-2.5 border transition-colors duration-150 overflow-hidden",
                statusConfig.containerClassName,
                isDragOver && !isCompleted && "ring-2 ring-primary/40 bg-accent/30 border-primary/40"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 px-1 mb-2.5 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "px-2 py-0.5 text-xs font-semibold rounded-full shadow-none border-0 truncate",
                            statusConfig.badgeClassName
                        )}
                    >
                        {IconComponent && <IconComponent className="size-3 mr-1 inline shrink-0" />}
                        <span className="truncate">{columnTitle}</span>
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">
                        {tasks.length}
                    </span>
                </div>

                {/* + Button only for active non-dues columns */}
                {canAddTask && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddTask(status)}
                        className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 shrink-0"
                        title={`Add task to ${columnTitle}`}
                    >
                        <Plus className="size-3.5" />
                    </Button>
                )}
            </div>

            {/* Column Body: Conditional ScrollArea when tasks > 8, fluid container otherwise */}
            {needsScroll ? (
                <ScrollArea className="max-h-160 flex-1 pr-1.5 overflow-hidden">
                    <div className="space-y-2 min-h-12.5 pb-2">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                            />
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex-1 space-y-2 min-h-12.5 pb-2 overflow-hidden">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEditTask}
                        />
                    ))}

                    {tasks.length === 0 && (
                        <div className="h-20 border border-dashed border-border/50 rounded-xl flex items-center justify-center text-[11px] text-muted-foreground/60 select-none">
                            No tasks
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
