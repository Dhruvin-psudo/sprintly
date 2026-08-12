import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarClock } from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import { format, addDays } from 'date-fns';

const extendDueSchema = z.object({
    newDueDate: z.string().min(1, 'Please select a valid future due date'),
}).refine((data) => new Date(data.newDueDate) > new Date(), {
    message: 'Due date must be in the future.',
    path: ['newDueDate'],
});

type ExtendDueFormValues = z.infer<typeof extendDueSchema>;

interface ExtendDueModalProps {
    open: boolean;
    task: Task | null;
    targetStatus: TaskStatus | null;
    onClose: () => void;
    onConfirm: (newDueDate: string) => void;
    isPending?: boolean;
}

export function ExtendDueModal({
    open,
    task,
    targetStatus,
    onClose,
    onConfirm,
    isPending,
}: ExtendDueModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExtendDueFormValues>({
        resolver: zodResolver(extendDueSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) {
            reset({
                newDueDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
            });
        }
    }, [open, reset]);

    if (!task) return null;

    const statusLabels: Record<string, string> = {
        TODO: 'To Do',
        IN_PROGRESS: 'In Progress',
        REVIEW: 'Review',
    };

    const onSubmit = (values: ExtendDueFormValues) => {
        onConfirm(new Date(values.newDueDate).toISOString());
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader className="space-y-3 sm:text-left">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <CalendarClock className="size-5" />
                            </div>
                            <DialogTitle className="text-base font-semibold text-left">
                                Extend Due Date to Change Status
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed text-left">
                            &ldquo;{task.title}&rdquo; is currently past due. To move it to{' '}
                            <strong className="text-foreground font-semibold">
                                {targetStatus ? statusLabels[targetStatus] || targetStatus : 'another status'}
                            </strong>
                            , you must extend its due date to a future date.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="extend-due-date" className="text-xs font-medium">
                                New Due Date & Time
                            </Label>
                            <Input
                                id="extend-due-date"
                                type="datetime-local"
                                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                className="text-xs"
                                disabled={isPending}
                                {...register('newDueDate')}
                            />
                            {errors.newDueDate && (
                                <p className="text-[11px] text-destructive font-medium">{errors.newDueDate.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white font-medium"
                            disabled={isPending}
                        >
                            {isPending ? 'Updating...' : 'Extend & Move Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
