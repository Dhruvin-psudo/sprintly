import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Shield, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles } from "../../user/hooks/use-roles";
import { useOrgMembers } from "../../user/hooks/use-org-members";
import { useInvitations } from "../hooks/use-invitations";
import { getRoleBadgeStyle } from "../../../utils/role-style";
import { invitationApi, type InvitationItem } from "@/api/services/invitation.api";

const inviteItemSchema = z.object({
  email: z.string().optional(),
  roleId: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteItemSchema>;

interface StagedInvite {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
}

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Extracts specific, human-readable error messages from backend API response payloads.
 */
function extractErrorMessage(err: unknown): string {
  const errResponse = (err as {
    response?: {
      data?: {
        message?: string | string[];
        details?: string | string[] | Record<string, string | string[]>;
        error?: string;
      };
    };
  })?.response?.data;

  if (!errResponse) return "Failed to send invitations.";

  // Extract from details object/array if available
  if (errResponse.details) {
    if (typeof errResponse.details === "string") return errResponse.details;
    if (Array.isArray(errResponse.details)) return errResponse.details.join(" ");
    if (typeof errResponse.details === "object") {
      const msgs = Object.values(errResponse.details).flat().join(" ");
      if (msgs) return msgs;
    }
  }

  // Extract from message
  if (errResponse.message) {
    if (Array.isArray(errResponse.message)) {
      return errResponse.message.join(" ");
    }
    if (typeof errResponse.message === "string" && errResponse.message !== "Validation failed") {
      return errResponse.message;
    }
  }

  if (errResponse.error && typeof errResponse.error === "string" && errResponse.error !== "Bad Request") {
    return errResponse.error;
  }

  return typeof errResponse.message === "string" && errResponse.message === "Validation failed"
    ? "An invitation has already been sent to this email address or is invalid."
    : typeof errResponse.message === "string"
    ? errResponse.message
    : "Failed to send invitations.";
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRoles(open);
  const { data: orgMembersResponse } = useOrgMembers();
  const { data: invitationsData } = useInvitations();

  const [stagedInvites, setStagedInvites] = useState<StagedInvite[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Exclude OWNER role from assignable roles
  const filteredRoles = roles.filter((role) => role.name.toUpperCase() !== "OWNER");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteItemSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  const currentEmail = watch("email")?.trim() || "";
  const currentRoleId = watch("roleId") || "";

  // Reset form and staged list whenever dialog opens
  useEffect(() => {
    if (open) {
      setStagedInvites([]);
      const defaultRole = filteredRoles.find((r) => r.name.toLowerCase() === "member") || filteredRoles[0];
      reset({
        email: "",
        roleId: defaultRole ? defaultRole.id : "",
      });
      clearErrors();
      setIsSending(false);
    }
  }, [open, reset, clearErrors]);

  // Set default selected role when roles load if not set
  useEffect(() => {
    if (filteredRoles.length > 0 && !currentRoleId) {
      const defaultRole = filteredRoles.find((r) => r.name.toLowerCase() === "member") || filteredRoles[0];
      setValue("roleId", defaultRole.id);
    }
  }, [filteredRoles, currentRoleId, setValue]);

  // Extract set of existing organization member emails (lowercase)
  const existingMemberEmails = new Set(
    (orgMembersResponse?.data || []).map((m) => m.email.toLowerCase())
  );

  // Extract set of pending invitation emails (lowercase)
  const invitationsList = Array.isArray(invitationsData)
    ? invitationsData
    : (invitationsData as unknown as { data: InvitationItem[] })?.data || [];
  const pendingInvitationEmails = new Set(
    invitationsList
      .filter((inv) => inv.status === "PENDING")
      .map((inv) => inv.email.toLowerCase())
  );

  // Validate single email string against format, duplicates, existing org members, and pending invitations
  const validateEmail = (emailStr: string): string | null => {
    const trimmed = emailStr.trim();
    if (!trimmed) {
      return "Please enter an email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address.";
    }
    if (existingMemberEmails.has(trimmed.toLowerCase())) {
      return `${trimmed} is already a member of this organization.`;
    }
    if (pendingInvitationEmails.has(trimmed.toLowerCase())) {
      return `${trimmed} already has a pending invitation.`;
    }
    if (stagedInvites.some((item) => item.email.toLowerCase() === trimmed.toLowerCase())) {
      return "This email has already been added to the invitation list.";
    }
    return null;
  };

  // Add typed email to staged invites list
  const handleAddMember = (): boolean => {
    const error = validateEmail(currentEmail);
    if (error) {
      setError("email", { type: "manual", message: error });
      toast.error(error);
      return false;
    }

    const roleObj = roles.find((r) => r.id === currentRoleId) || filteredRoles[0];
    const newInvite: StagedInvite = {
      id: crypto.randomUUID(),
      email: currentEmail,
      roleId: roleObj.id,
      roleName: roleObj.name,
    };

    setStagedInvites((prev) => [...prev, newInvite]);
    clearErrors("email");

    // Reset form email field and restore default role
    const defaultRole = filteredRoles.find((r) => r.name.toLowerCase() === "member") || filteredRoles[0];
    reset({
      email: "",
      roleId: defaultRole ? defaultRole.id : currentRoleId,
    });

    return true;
  };

  // Remove staged invite item
  const handleRemoveStagedInvite = (id: string) => {
    setStagedInvites((prev) => prev.filter((item) => item.id !== id));
  };

  // Send all staged invitations in batch
  const handleSendInvites = async () => {
    let currentBatch = [...stagedInvites];

    // If an email is currently typed in input when clicking "Send invites", attempt to auto-stage it
    if (currentEmail) {
      const error = validateEmail(currentEmail);
      if (error) {
        setError("email", { type: "manual", message: error });
        toast.error(error);
        return;
      }
      const roleObj = roles.find((r) => r.id === currentRoleId) || filteredRoles[0];
      const autoStaged: StagedInvite = {
        id: crypto.randomUUID(),
        email: currentEmail,
        roleId: roleObj.id,
        roleName: roleObj.name,
      };
      currentBatch.push(autoStaged);
      setStagedInvites(currentBatch);

      const defaultRole = filteredRoles.find((r) => r.name.toLowerCase() === "member") || filteredRoles[0];
      reset({
        email: "",
        roleId: defaultRole ? defaultRole.id : currentRoleId,
      });
      clearErrors("email");
    }

    if (currentBatch.length === 0) {
      const err = "Please enter an email address to invite.";
      setError("email", { type: "manual", message: err });
      toast.error(err);
      return;
    }

    setIsSending(true);

    try {
      // Group staged emails by roleId for batch dispatch
      const groupedByRole: Record<string, string[]> = {};
      currentBatch.forEach((item) => {
        if (!groupedByRole[item.roleId]) {
          groupedByRole[item.roleId] = [];
        }
        groupedByRole[item.roleId].push(item.email);
      });

      // Send API requests for each role group
      await Promise.all(
        Object.entries(groupedByRole).map(([roleId, emails]) =>
          invitationApi.send({ emails, roleId })
        )
      );

      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
      queryClient.invalidateQueries({ queryKey: ["my-pending-invitations"] });

      toast.success(
        currentBatch.length === 1
          ? "Invitation sent successfully!"
          : `Sent ${currentBatch.length} invitations successfully!`
      );

      // Reset state and close modal
      setStagedInvites([]);
      reset({ email: "", roleId: filteredRoles[0]?.id || "" });
      clearErrors();
      onOpenChange(false);
    } catch (err: unknown) {
      const specificError = extractErrorMessage(err);
      toast.error(specificError);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStagedInvites([]);
      reset({ email: "", roleId: "" });
      clearErrors();
      setIsSending(false);
    }
    onOpenChange(newOpen);
  };

  const canSend = stagedInvites.length > 0 || currentEmail.length > 0;
  const selectedRole = roles.find((r) => r.id === currentRoleId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125 p-6 border border-border shadow-xl bg-background">
        <DialogHeader className="space-y-1 text-left pr-6">
          <DialogTitle className="text-foreground">
            Invite members
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Invite teammates by email. They&apos;ll get a link to join this workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSendInvites)} className="space-y-4 py-2">
          {/* Email Address Input */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-semibold text-foreground">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ada@company.com"
              {...register("email")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              className={errors?.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Role Select */}
          <div className="space-y-1.5">
            <Label htmlFor="roleId" className="font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Role for this batch
            </Label>
            <Select
              value={currentRoleId || ""}
              onValueChange={(val) => {
                if (val) setValue("roleId", val);
              }}
            >
              <SelectTrigger id="roleId">
                <SelectValue placeholder="Select role...">
                  {selectedRole ? selectedRole.name : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id} label={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-xs text-destructive font-medium">{errors.roleId.message}</p>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMember}
              className="flex-1"
            >
              <Plus className="size-4" />
              Invite another user
            </Button>
            <Button
              type="submit"
              disabled={!canSend || isSending}
              className="flex-1 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Sending...
                </>
              ) : (
                "Send invites"
              )}
            </Button>
          </div>

          {/* Total Members to Invite Section */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 mt-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="font-semibold text-sm text-foreground">Total members to invite</span>
              </div>
              <Badge variant='outline' className="bg-muted text-muted-foreground rounded-full text-xs font-semibold px-2.5 py-0.5 border-0">
                {stagedInvites.length}
              </Badge>
            </div>

            {stagedInvites.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground font-normal border border-dashed border-border/60 rounded-xl">
                No members added to batch yet. Type an email above and click &quot;Invite another user&quot;.
              </div>
            ) : (
              <ScrollArea className="max-h-52 pr-1">
                <div className="space-y-2">
                  {stagedInvites.map((item) => {
                    const roleStyle = getRoleBadgeStyle(item.roleName);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-background shadow-2xs"
                      >
                        <span className="font-medium text-sm text-foreground truncate min-w-0 flex-1">
                          {item.email}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant='outline' className={`${roleStyle.className}`}>
                            {roleStyle.label}
                          </Badge>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveStagedInvite(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
