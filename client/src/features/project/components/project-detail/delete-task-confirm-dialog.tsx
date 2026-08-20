import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteTaskConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteTaskConfirmDialog({
  open,
  onOpenChange,
  taskTitle,
  onConfirm,
  isPending,
}: DeleteTaskConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="size-5 shrink-0" />
            <DialogTitle className="text-base">Delete task</DialogTitle>
          </div>
          <DialogDescription className="text-sm pt-1">
            Are you sure you want to delete <span className="font-semibold text-foreground">&ldquo;{taskTitle}&rdquo;</span>?
            This action cannot be undone and will permanently remove the task.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Deleting…" : "Delete task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
