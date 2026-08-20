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

interface RemoveMemberConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberEmail?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function RemoveMemberConfirmDialog({
  open,
  onOpenChange,
  memberName,
  memberEmail,
  onConfirm,
  isPending,
}: RemoveMemberConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="size-5 shrink-0" />
            <DialogTitle className="text-base">Remove member from project</DialogTitle>
          </div>
          <DialogDescription className="text-sm pt-1">
            Are you sure you want to remove <span className="font-semibold text-foreground">{memberName}</span>
            {memberEmail && <span className="text-muted-foreground"> ({memberEmail})</span>} from this project?
            They will lose access to project tasks and activities.
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
            {isPending ? "Removing…" : "Remove member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
