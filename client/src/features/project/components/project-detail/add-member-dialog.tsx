import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useWorkspaceMembers } from "../../hooks/use-workspace-members";
import { useAddProjectMembers } from "../../hooks/use-add-project-members";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const addMembersSchema = z.object({
  memberIds: z.array(z.string()).min(1, "Select at least one member to add"),
});

type AddMembersFormValues = z.infer<typeof addMembersSchema>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingMemberUserIds: string[];
}

export function AddMemberDialog({
  open,
  onOpenChange,
  projectId,
  existingMemberUserIds,
}: AddMemberDialogProps) {
  const { allMembers, isLoading } = useWorkspaceMembers();
  const addMembersMutation = useAddProjectMembers(projectId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<AddMembersFormValues>({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      memberIds: [],
    },
  });

  const selectedIds = watch("memberIds") || [];

  // Available members to add (exclude members already in the project)
  const availableMembers = allMembers.filter((m) => !existingMemberUserIds.includes(m.id));

  const toggleSelection = (memberId: string) => {
    const nextIds = selectedIds.includes(memberId)
      ? selectedIds.filter((id) => id !== memberId)
      : [...selectedIds, memberId];
    setValue("memberIds", nextIds, { shouldValidate: true });
  };

  const handleRemoveChip = (memberId: string) => {
    const nextIds = selectedIds.filter((id) => id !== memberId);
    setValue("memberIds", nextIds, { shouldValidate: true });
  };

  const handleClose = () => {
    reset({ memberIds: [] });
    setIsDropdownOpen(false);
    onOpenChange(false);
  };

  const onSubmit = (data: AddMembersFormValues) => {
    addMembersMutation.mutate(data.memberIds, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const selectedMembers = availableMembers.filter((m) => selectedIds.includes(m.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add project members</DialogTitle>
          <DialogDescription>
            Select members from your organization to add to this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Member Selection Popover */}
          <div className="space-y-1.5 relative">
            <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <PopoverTrigger
                type="button"
                className="w-full flex items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-left hover:border-primary/50 font-normal cursor-pointer"
              >
                <span className="text-muted-foreground">
                  {selectedIds.length > 0
                    ? `${selectedIds.length} member${selectedIds.length > 1 ? "s" : ""} selected`
                    : "Select organization members"}
                </span>
                <Plus className="size-4 text-muted-foreground" />
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[calc(100vw-4rem)] max-w-md max-h-60 overflow-y-auto p-1.5 shadow-lg"
              >
                <p className="text-[11px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  Organization Members
                </p>
                {isLoading ? (
                  <p className="text-xs text-muted-foreground p-2">Loading members…</p>
                ) : availableMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">All org members are already in this project.</p>
                ) : (
                  availableMembers.map((member) => {
                    const isSelected = selectedIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => toggleSelection(member.id)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarColor}`}>
                            {member.initials}
                          </span>
                          <span className="text-sm font-medium">{member.name}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${member.roleColor}`}>
                            {member.role}
                          </span>
                        </div>
                        {isSelected && <Check className="size-4 text-primary" />}
                      </div>
                    );
                  })
                )}
              </PopoverContent>
            </Popover>

            {/* Selected Chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/50 transition-all"
                  >
                    <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${m.avatarColor}`}>
                      {m.initials}
                    </span>
                    <span>{m.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(m.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedIds.length === 0 || addMembersMutation.isPending}
              className="bg-gradient-brand text-white hover:opacity-90 shadow-glow"
            >
              {addMembersMutation.isPending ? "Adding…" : `Add ${selectedIds.length ? selectedIds.length : ""} Members`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
