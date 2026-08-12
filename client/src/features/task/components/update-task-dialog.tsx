import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, TaskPriority, TaskStatus, UpdateTaskInput } from '../types';
import { format } from 'date-fns';

const updateTaskSchema = z.object({
    title: z.string().trim().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DUE', 'COMPLETED'] as const),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const),
    dueDate: z.string().min(1, 'Due date is required'),
});

type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

interface UpdateTaskDialogProps {
    open: boolean;
    task: Task | null;
    onClose: () => void;
    onSubmit: (params: { projectId: string; data: UpdateTaskInput }) => void;
    isPending?: boolean;
}

export function UpdateTaskDialog({
    open,
    task,
    onClose,
    onSubmit,
    isPending,
}: UpdateTaskDialogProps) {
    const isOverdue = task?.status === 'DUE';

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors },
    } = useForm<UpdateTaskFormValues>({
        resolver: zodResolver(updateTaskSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    useEffect(() => {
        if (open && task) {
            const activeStatus = (['TODO', 'IN_PROGRESS', 'REVIEW', 'DUE'].includes(task.status)
                ? task.status
                : 'TODO') as TaskStatus;

            reset({
                title: task.title || '',
                description: task.description || '',
                status: activeStatus,
                priority: task.priority || 'MEDIUM',
                dueDate: task.dueDate
                    ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm")
                    : '',
            });
        }
    }, [open, task, reset]);

    if (!task) return null;

    const onFormSubmit = (values: UpdateTaskFormValues) => {
        const effectiveProjectId = task.projectId;
        if (!effectiveProjectId) return;

        const now = new Date();
        const selectedDate = new Date(values.dueDate);

        // Validation for edit: if date was explicitly changed, cannot set to past date
        if (task.dueDate) {
            const isDateChanged = format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") !== values.dueDate;
            if (isDateChanged && selectedDate < now) {
                setError('dueDate', {
                    type: 'manual',
                    message: 'Due date cannot be set to a past date',
                });
                return;
            }
        }

        const dataPayload: UpdateTaskInput = {
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
            status: values.status,
            priority: values.priority,
            dueDate: new Date(values.dueDate).toISOString(),
        };

        onSubmit({
            projectId: effectiveProjectId,
            data: dataPayload,
        });
    };

    // Allowed status choices in update modal: TODO, IN_PROGRESS, REVIEW, (and DUE if editing overdue task)
    const allowedStatuses: { value: TaskStatus; label: string }[] = [
        { value: 'TODO', label: 'To Do' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'REVIEW', label: 'Review' },
        ...(isOverdue ? [{ value: 'DUE' as TaskStatus, label: 'Dues' }] : []),
    ];

    const allowedPriorities: {value: TaskPriority; label: string }[] = [
        { value: 'LOW', label: 'Low'},
        { value: 'MEDIUM', label: 'Medium'},
        { value: 'HIGH', label: 'High'},
        { value: 'URGENT', label: 'Urgent'}
    ];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Edit Task
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="update-task-title" className="text-xs font-medium">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="update-task-title"
                            placeholder="e.g. Design new empty states"
                            className="text-xs"
                            disabled={isPending}
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-[11px] text-destructive font-medium">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="update-task-desc" className="text-xs font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="update-task-desc"
                            placeholder="Add detailed task description..."
                            rows={3}
                            className="text-xs resize-none"
                            disabled={isPending}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-[11px] text-destructive font-medium">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Status Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                Status {isOverdue && <span className="text-[10px] text-muted-foreground">(Locked)</span>}
                            </Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || 'TODO'}
                                        disabled={isOverdue || isPending}
                                        onValueChange={(val) => field.onChange(val as TaskStatus)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue>
                                                {allowedStatuses.find((s) => s.value === field.value)?.label || 'To Do'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent alignItemWithTrigger={false}>
                                            {allowedStatuses.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.status && (
                                <p className="text-[11px] text-destructive font-medium">{errors.status.message}</p>
                            )}
                        </div>

                        {/* Priority Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Priority</Label>
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || 'MEDIUM'}
                                        disabled={isPending}
                                        onValueChange={(val) => field.onChange(val as TaskPriority)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority">
                                                {allowedPriorities.find((s) => s.value === field.value)?.label || 'Medium'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent alignItemWithTrigger={false}>
                                            {allowedPriorities.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.priority && (
                                <p className="text-[11px] text-destructive font-medium">{errors.priority.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="update-task-due" className="text-xs font-medium">
                            Due Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="update-task-due"
                            type="datetime-local"   
                            className="text-xs h-9"
                            disabled={isPending}
                            {...register('dueDate')}
                        />
                        {errors.dueDate && (
                            <p className="text-[11px] text-destructive font-medium">{errors.dueDate.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className='bg-gradient-brand text-white opacity-90 shadow-glow'>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
