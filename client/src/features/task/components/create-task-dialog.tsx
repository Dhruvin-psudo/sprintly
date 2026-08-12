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
import type { TaskPriority, TaskStatus, CreateTaskInput, TaskProject } from '../types';
import { format, addDays } from 'date-fns';

const createTaskSchema = z.object({
    projectId: z.string().min(1, 'Please select a project'),
    title: z.string().trim().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW'] as const),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const),
    dueDate: z.string().min(1, 'Due date is required'),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
    open: boolean;
    initialStatus?: TaskStatus;
    isStatusDisabled?: boolean;
    projects?: TaskProject[];
    defaultProjectId?: string;
    onClose: () => void;
    onSubmit: (params: { projectId: string; data: CreateTaskInput }) => void;
    isPending?: boolean;
}

export function CreateTaskDialog({
    open,
    initialStatus = 'TODO',
    isStatusDisabled = false,
    projects = [],
    defaultProjectId,
    onClose,
    onSubmit,
    isPending,
}: CreateTaskDialogProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors },
    } = useForm<CreateTaskFormValues>({
        resolver: zodResolver(createTaskSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    useEffect(() => {
        if (open) {
            const activeStatus = (['TODO', 'IN_PROGRESS', 'REVIEW'].includes(initialStatus)
                ? initialStatus
                : 'TODO') as 'TODO' | 'IN_PROGRESS' | 'REVIEW';

            reset({
                projectId: defaultProjectId || (projects.length > 0 ? projects[0].id : ''),
                title: '',
                description: '',
                status: activeStatus,
                priority: 'MEDIUM',
                dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
            });
        }
    }, [open, initialStatus, defaultProjectId, projects, reset]);

    const onFormSubmit = (values: CreateTaskFormValues) => {
        const effectiveProjectId = values.projectId || defaultProjectId;
        if (!effectiveProjectId) {
            setError('projectId', {
                type: 'manual',
                message: 'Please select a project for this task',
            });
            return;
        }

        const now = new Date();
        const selectedDate = new Date(values.dueDate);

        if (selectedDate < now) {
            setError('dueDate', {
                type: 'manual',
                message: 'Due date cannot be in the past when creating a task',
            });
            return;
        }

        onSubmit({
            projectId: effectiveProjectId,
            data: {
                title: values.title.trim(),
                description: values.description?.trim() || undefined,
                status: values.status,
                priority: values.priority,
                dueDate: new Date(values.dueDate).toISOString(),
            },
        });
    };

    const allowedStatuses: { value: 'TODO' | 'IN_PROGRESS' | 'REVIEW'; label: string }[] = [
        { value: 'TODO', label: 'To Do' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'REVIEW', label: 'Review' },
    ];

    const allowedPriorities: {value: TaskPriority; label: string }[] = [
        { value: 'LOW', label: 'Low'},
        { value: 'MEDIUM', label: 'Medium'},
        { value: 'HIGH', label: 'High'},
        { value: 'URGENT', label: 'Urgent'}
    ];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-lg bg-background">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Create New Task
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
                    {/* Project Selector (Required) */}
                    <div className="space-y-1.5">
                        <Label className="font-semibold">
                            Project <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                            name="projectId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value || ''}
                                    onValueChange={(val) => field.onChange(val)}
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a project">
                                            {projects.find((p) => p.id === field.value)?.name || 'Select a project'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent alignItemWithTrigger={false}>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} {p.code ? `(${p.code})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.projectId && (
                            <p className="text-xs text-destructive font-medium">{errors.projectId.message}</p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="create-task-title" className="font-semibold">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="create-task-title"
                            placeholder="e.g. Design new empty states"
                            disabled={isPending}
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-[11px] text-destructive font-medium">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="create-task-desc" className="font-semibold">
                            Description
                        </Label>
                        <Textarea
                            id="create-task-desc"
                            placeholder="Add detailed task description..."
                            rows={3}
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
                            <Label className="font-semibold">
                                Status {isStatusDisabled && <span className="text-[10px] text-muted-foreground">(Locked)</span>}
                            </Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || 'TODO'}
                                        disabled={isStatusDisabled || isPending}
                                        onValueChange={(val) => field.onChange(val as 'TODO' | 'IN_PROGRESS' | 'REVIEW')}
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
                                <p className="text-xs text-destructive font-medium">{errors.status.message}</p>
                            )}
                        </div>

                        {/* Priority Selector */}
                        <div className="space-y-1.5">
                            <Label className="font-semibold">Priority</Label>
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
                        <Label htmlFor="create-task-due" className="font-semibold">
                            Due Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="create-task-due"
                            type="datetime-local"
                            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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
                        <Button type="submit" disabled={isPending} className="bg-gradient-brand text-white hover:opacity-90 shadow-glow">
                            {isPending ? 'Creating...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
