import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { Task } from '../types';

interface CompletionModalProps {
    open: boolean;
    task: Task | null;
    onClose: () => void;
    onConfirm: () => void;
    isPending?: boolean;
}

export function CompletionModal({
    open,
    task,
    onClose,
    onConfirm,
    isPending,
}: CompletionModalProps) {
    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3 sm:text-left">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <AlertTriangle className="size-5" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-left">
                            Mark Task as Completed?
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed text-left">
                        This is an <strong className="text-foreground font-semibold">irreversible process</strong>. Once you mark &ldquo;{task.title}&rdquo; as completed:
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li>The task will be locked and cannot be moved out of the Completed section.</li>
                            <li>Its due date will automatically be updated to today.</li>
                        </ul>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? 'Completing...' : 'Confirm & Complete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
