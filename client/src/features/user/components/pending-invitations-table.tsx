import { useState } from "react";
import { Mail, RefreshCw, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";

import type { InvitationItem } from "@/api/services/invitation.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInvitations } from "@/features/invitation/hooks/use-invitations";
import { useResendInvitation } from "@/features/invitation/hooks/use-resend-invitation";
import { useRevokeInvitation } from "@/features/invitation/hooks/use-revoke-invitation";
import { getRoleBadgeStyle } from "@/utils/role-style";

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return (
        <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Accepted
        </Badge>
      );
    case "REVOKED":
    case "DECLINED":
    case "EXPIRED":
      return (
        <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive">
          <XCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PendingInvitationsTable() {
  const [revokingInv, setRevokingInv] = useState<InvitationItem | null>(null);

  const { data: invitations = [], isLoading, error, refetch } = useInvitations();

  const resendMutation = useResendInvitation();

  const revokeMutation = useRevokeInvitation({
    onSuccess: () => setRevokingInv(null)
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 p-6 text-center">
        <p className="text-sm text-destructive">Failed to load pending invitations.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-2 text-sm font-medium">No invitations sent yet</p>
        <p className="text-xs text-muted-foreground">Click "Invite Member" above to send invitations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => {
              const isPending = inv.status === "PENDING";
              const isExpired = inv.status === "EXPIRED";

              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-sm">{inv.email}</TableCell>
                  <TableCell>
                    {(() => {
                      const roleStyle = getRoleBadgeStyle(inv.role.name);
                      return (
                        <Badge variant='outline' className={`${roleStyle.className}`}>
                          {roleStyle.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(isPending || isExpired) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Resend Link"
                          disabled={resendMutation.isPending}
                          onClick={() => resendMutation.mutate(inv.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}

                      {isPending && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Revoke Invitation"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRevokingInv(inv)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Revoke Confirmation Dialog */}
      {revokingInv && (
        <Dialog open={!!revokingInv} onOpenChange={(open) => !open && setRevokingInv(null)}>
          <DialogContent className="sm:max-w-100">
            <DialogHeader>
              <DialogTitle>Revoke Invitation</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke the invitation for <strong>{revokingInv.email}</strong>? The invitation link will immediately become invalid.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokingInv(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate(revokingInv.id)}
              >
                Revoke Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
