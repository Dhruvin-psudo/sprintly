import { useState, useMemo, useEffect } from 'react';
import { KanbanColumn } from './kanban-column';
import { CompletionModal } from './completion-modal';
import { ExtendDueModal } from './extend-due-modal';
import { CreateTaskDialog } from './create-task-dialog';
import { UpdateTaskDialog } from './update-task-dialog';
import { useUpdateTask } from '../hooks/useUpdateTask';
import { useCreateTask } from '../hooks/useCreateTask';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput, TaskProject } from '../types';
import { toast } from 'sonner';

function KanbanBoardSkeleton() {
    const columnCardCounts = [4, 2, 1, 1, 3];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full items-stretch min-w-[700px] lg:min-w-0">
            {columnCardCounts.map((cardCount, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-3 p-3 rounded-2xl bg-card border border-border/50 min-h-80">
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <Skeleton className="h-5 w-24 rounded-md" />
                        <Skeleton className="h-5 w-6 rounded-full" />
                    </div>
                    {Array.from({ length: cardCount }).map((_, cardIndex) => (
                        <Skeleton key={cardIndex} className="h-24 w-full rounded-xl shrink-0" />
                    ))}
                </div>
            ))}
        </div>
    );
}

interface TaskKanbanBoardProps {
    projectId?: string;
    projects?: TaskProject[];
    tasks: Task[] | readonly Task[];
    isLoading?: boolean;
    isCreateDialogOpen?: boolean;
    onCloseCreateDialog?: () => void;
}

export function TaskKanbanBoard({
    projectId,
    projects = [],
    tasks,
    isLoading,
    isCreateDialogOpen = false,
    onCloseCreateDialog,
}: TaskKanbanBoardProps) {
    const updateTaskMutation = useUpdateTask();
    const createTaskMutation = useCreateTask();

    // Modal States
    const [completionModalTask, setCompletionModalTask] = useState<Task | null>(null);
    const [extendDueModalTask, setExtendDueModalTask] = useState<{ task: Task; targetStatus: TaskStatus } | null>(null);
    
    const [createTaskDialogState, setCreateTaskDialogState] = useState<{
        open: boolean;
        initialStatus?: TaskStatus;
        isStatusDisabled?: boolean;
    }>({
        open: false,
    });

    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Handle external trigger for create dialog (e.g. page header button)
    useEffect(() => {
        if (isCreateDialogOpen) {
            setCreateTaskDialogState({
                open: true,
                initialStatus: 'TODO',
                isStatusDisabled: false,
            });
        }
    }, [isCreateDialogOpen]);

    // Handle dialog close
    const handleCloseCreateDialog = () => {
        setCreateTaskDialogState({ open: false });
        if (onCloseCreateDialog) {
            onCloseCreateDialog();
        }
    };

    const handleCloseUpdateDialog = () => {
        setEditingTask(null);
    };

    // Render-time check to sync past due tasks to DUE status in memory & sync backend
    const processedTasks = useMemo(() => {
        const now = new Date();
        return tasks.map((task) => {
            if (
                task.dueDate &&
                new Date(task.dueDate) < now &&
                task.status !== 'COMPLETED' &&
                task.status !== 'DUE'
            ) {
                return { ...task, status: 'DUE' as TaskStatus };
            }
            return task;
        });
    }, [tasks]);

    // Optional silent auto-sync to backend for past due tasks
    useEffect(() => {
        const now = new Date();
        tasks.forEach((task) => {
            if (
                task.dueDate &&
                new Date(task.dueDate) < now &&
                task.status !== 'COMPLETED' &&
                task.status !== 'DUE' &&
                projectId
            ) {
                updateTaskMutation.mutate({
                    projectId: task.projectId || projectId,
                    id: task.id,
                    data: { status: 'DUE' },
                });
            }
        });
    }, [tasks, projectId]);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const map: Record<TaskStatus, Task[]> = {
            TODO: [],
            IN_PROGRESS: [],
            REVIEW: [],
            DUE: [],
            COMPLETED: [],
        };
        processedTasks.forEach((task) => {
            if (map[task.status]) {
                map[task.status].push(task);
            } else {
                map.TODO.push(task);
            }
        });
        return map;
    }, [processedTasks]);

    // Drag Drop Handler
    const handleDropTask = (taskId: string, targetStatus: TaskStatus, fromStatus: TaskStatus) => {
        const task = processedTasks.find((t) => t.id === taskId);
        if (!task) return;

        // Rule 1: Once COMPLETED, task cannot be moved out
        if (fromStatus === 'COMPLETED' || task.status === 'COMPLETED') {
            toast.error('Completed tasks cannot be moved out of the Completed section.');
            return;
        }

        // No-op if target status is same
        if (fromStatus === targetStatus) return;

        // Rule 2: Moving to COMPLETED triggers confirmation modal
        if (targetStatus === 'COMPLETED') {
            setCompletionModalTask(task);
            return;
        }

        // Rule 3: Moving from DUE to TODO, IN_PROGRESS, or REVIEW requires extending due date
        if (fromStatus === 'DUE' && ['TODO', 'IN_PROGRESS', 'REVIEW'].includes(targetStatus)) {
            setExtendDueModalTask({ task, targetStatus });
            return;
        }

        // Rule 4: Moving into DUE requires past due date validation
        if (targetStatus === 'DUE') {
            if (!task.dueDate || new Date(task.dueDate) >= new Date()) {
                toast.error('Cannot manually move a task to Dues unless its due date is in the past.');
                return;
            }
        }

        // Standard status update
        const effectiveProjectId = task.projectId || projectId;
        if (!effectiveProjectId) {
            toast.error('Project ID missing for task update');
            return;
        }

        updateTaskMutation.mutate({
            projectId: effectiveProjectId,
            id: task.id,
            data: { status: targetStatus },
        });
    };

    // Confirm Completion Handler
    const handleConfirmCompletion = () => {
        if (!completionModalTask) return;
        const effectiveProjectId = completionModalTask.projectId || projectId;
        if (!effectiveProjectId) return;

        updateTaskMutation.mutate(
            {
                projectId: effectiveProjectId,
                id: completionModalTask.id,
                data: {
                    status: 'COMPLETED',
                    dueDate: new Date().toISOString(),
                },
            },
            {
                onSettled: () => setCompletionModalTask(null),
            }
        );
    };

    // Confirm Due Extension Handler
    const handleConfirmExtendDue = (newDueDateIso: string) => {
        if (!extendDueModalTask) return;
        const { task, targetStatus } = extendDueModalTask;
        const effectiveProjectId = task.projectId || projectId;
        if (!effectiveProjectId) return;

        updateTaskMutation.mutate(
            {
                projectId: effectiveProjectId,
                id: task.id,
                data: {
                    status: targetStatus,
                    dueDate: newDueDateIso,
                },
            },
            {
                onSettled: () => setExtendDueModalTask(null),
            }
        );
    };

    // Create Task Submit Handler
    const handleCreateTaskSubmit = ({
        projectId: targetProjectId,
        data,
    }: {
        projectId: string;
        data: CreateTaskInput;
    }) => {
        const effectiveProjectId = targetProjectId || projectId;
        if (!effectiveProjectId) {
            toast.error('Please select a project to create a task');
            return;
        }

        createTaskMutation.mutate(
            {
                projectId: effectiveProjectId,
                data,
            },
            {
                onSuccess: handleCloseCreateDialog,
            }
        );
    };

    // Update Task Submit Handler
    const handleUpdateTaskSubmit = ({
        projectId: targetProjectId,
        data,
    }: {
        projectId: string;
        data: UpdateTaskInput;
    }) => {
        if (!editingTask) return;
        const effectiveProjectId = targetProjectId || editingTask.projectId || projectId;
        if (!effectiveProjectId) return;

        updateTaskMutation.mutate(
            {
                projectId: effectiveProjectId,
                id: editingTask.id,
                data,
            },
            {
                onSuccess: handleCloseUpdateDialog,
            }
        );
    };

    if (isLoading) {
        return <KanbanBoardSkeleton />;
    }

    return (
        <div className="space-y-4 w-full">
            {/* Board Columns Row — 5 columns responsive grid (min-width overflow on small mobile, items-stretch for equal heights) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full items-stretch min-w-[700px] lg:min-w-0">
                {/* 1. To Do */}
                <KanbanColumn
                    status="TODO"
                    tasks={tasksByStatus.TODO}
                    onAddTask={(st) => setCreateTaskDialogState({ open: true, initialStatus: st, isStatusDisabled: true })}
                    onEditTask={(t) => setEditingTask(t)}
                    onDropTask={handleDropTask}
                />

                {/* 2. In Progress */}
                <KanbanColumn
                    status="IN_PROGRESS"
                    tasks={tasksByStatus.IN_PROGRESS}
                    onAddTask={(st) => setCreateTaskDialogState({ open: true, initialStatus: st, isStatusDisabled: true })}
                    onEditTask={(t) => setEditingTask(t)}
                    onDropTask={handleDropTask}
                />

                {/* 3. Review */}
                <KanbanColumn
                    status="REVIEW"
                    tasks={tasksByStatus.REVIEW}
                    onAddTask={(st) => setCreateTaskDialogState({ open: true, initialStatus: st, isStatusDisabled: true })}
                    onEditTask={(t) => setEditingTask(t)}
                    onDropTask={handleDropTask}
                />

                {/* 4. Dues (Red Destructive Badge, No + Button) */}
                <KanbanColumn
                    status="DUE"
                    tasks={tasksByStatus.DUE}
                    onEditTask={(t) => setEditingTask(t)}
                    onDropTask={handleDropTask}
                />

                {/* 5. Completed (Distinct Disabled UI Section, No + Button) */}
                <KanbanColumn
                    status="COMPLETED"
                    tasks={tasksByStatus.COMPLETED}
                    onEditTask={(t) => setEditingTask(t)}
                    onDropTask={handleDropTask}
                />
            </div>

            {/* Modals */}
            <CompletionModal
                open={!!completionModalTask}
                task={completionModalTask}
                onClose={() => setCompletionModalTask(null)}
                onConfirm={handleConfirmCompletion}
                isPending={updateTaskMutation.isPending}
            />

            <ExtendDueModal
                open={!!extendDueModalTask}
                task={extendDueModalTask?.task || null}
                targetStatus={extendDueModalTask?.targetStatus || null}
                onClose={() => setExtendDueModalTask(null)}
                onConfirm={handleConfirmExtendDue}
                isPending={updateTaskMutation.isPending}
            />

            <CreateTaskDialog
                open={createTaskDialogState.open}
                initialStatus={createTaskDialogState.initialStatus}
                isStatusDisabled={createTaskDialogState.isStatusDisabled}
                projects={projects}
                defaultProjectId={projectId}
                onClose={handleCloseCreateDialog}
                onSubmit={handleCreateTaskSubmit}
                isPending={createTaskMutation.isPending}
            />

            <UpdateTaskDialog
                open={!!editingTask}
                task={editingTask}
                onClose={handleCloseUpdateDialog}
                onSubmit={handleUpdateTaskSubmit}
                isPending={updateTaskMutation.isPending}
            />
        </div>
    );
}
