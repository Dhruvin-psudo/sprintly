import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePendingInvitationsModal } from '@/store/pending-invitations-modal-context';
import { useMyPendingInvitations } from '../hooks/use-my-pending-invitations';
import { useAcceptPendingInvitation } from '../hooks/use-accept-pending-invitation';
import { useDeclinePendingInvitation } from '../hooks/use-decline-pending-invitation';
import { getRoleBadgeStyle } from '@/utils/role-style';
import type { InvitationItem } from '@/api/services/invitation.api';

export function PendingInvitationsDialog() {
  const { isOpen, setIsOpen, closeModal } = usePendingInvitationsModal();
  const { invitations, isLoading } = useMyPendingInvitations();
  const acceptMutation = useAcceptPendingInvitation({ onSuccess: closeModal });
  const declineMutation = useDeclinePendingInvitation({ onSuccess: closeModal });

  const count = invitations.length;
  const titleText =
    count === 1 ? 'You have 1 new invitation' : count > 1 ? `You have ${count} new invitations` : 'No pending invitations';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-6 border border-border shadow-xl bg-background">
        <DialogHeader className="space-y-1 text-left pr-6">
          <DialogTitle className="text-foreground">
            {titleText}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose which workspaces you&apos;d like to join.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading invitations...
            </div>
          ) : count === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              You don&apos;t have any pending workspace invitations right now.
            </div>
          ) : (
            <ScrollArea className="max-h-105 pr-2">
              <div className="space-y-4 py-1">
                {invitations.map((inv: InvitationItem) => {
                  const orgName = inv.organization?.name || 'Workspace';
                  const initialLetter = orgName.charAt(0).toUpperCase();
                  const inviterName = inv.invitedByUser
                    ? `${inv.invitedByUser.firstName} ${inv.invitedByUser.lastName || ''}`.trim()
                    : 'Team Admin';
                  const roleStyle = getRoleBadgeStyle(inv.role?.name);

                  return (
                    <div
                      key={inv.id}
                      className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4 shadow-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                          {initialLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-base truncate">
                              {orgName}
                            </span>
                            <Badge variant="outline" className={`${roleStyle.className}`}>
                              {roleStyle.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs mt-0.5 truncate">
                            Invited by <span className="font-medium text-foreground">{inviterName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <Button
                          size="sm"
                          className='text-white'
                          onClick={() => acceptMutation.mutate(inv.id)}
                          disabled={acceptMutation.isPending || declineMutation.isPending}
                        >
                          Accept invite
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => declineMutation.mutate(inv.id)}
                          disabled={acceptMutation.isPending || declineMutation.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            onClick={closeModal}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
