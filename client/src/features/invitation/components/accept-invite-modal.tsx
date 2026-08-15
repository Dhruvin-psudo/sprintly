import { useNavigate, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVerifyInvitation } from '../hooks/use-verify-invitation';
import { useAcceptInvitation } from '../hooks/use-accept-invitation';
import { useDeclineInvitation } from '../hooks/use-decline-invitation';
import { toast } from 'sonner';

export function AcceptInviteModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const navigate = useNavigate();

  const { invitation, isLoading } = useVerifyInvitation(inviteToken as string, !!inviteToken);

  const acceptMutation = useAcceptInvitation({
    onSuccess: () => {
      toast.success(`Welcome to ${invitation?.organization?.name || 'the team'}!`);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('inviteToken');
      setSearchParams(newParams);
      navigate('/dashboard');
    }
  });

  const declineMutation = useDeclineInvitation({
    onSuccess: () => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('inviteToken');
      setSearchParams(newParams);
    }
  });

  const isOpen = !!inviteToken;

  function handleOpenChange(open: boolean) {
    if (!open) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('inviteToken');
      setSearchParams(newParams);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Organization Invitation</DialogTitle>
          <DialogDescription>
            You have been invited to join an organization.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading invitation details...</div>
        ) : invitation && invitation.organization ? (
          <div className="space-y-4">
            <div className="rounded-md border p-4 space-y-2 text-sm">
              <p>
                <strong className="font-medium">Organization:</strong> {invitation.organization.name}
              </p>
              <p>
                <strong className="font-medium">Inviter:</strong> {invitation.inviter?.firstName}{' '}
                {invitation.inviter?.lastName || ''}
              </p>
              <p>
                <strong className="font-medium">Assigned Role:</strong> <Badge variant="secondary">{invitation.role?.name || 'Member'}</Badge>
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => declineMutation.mutate(inviteToken || '')}
                disabled={declineMutation.isPending || acceptMutation.isPending}
              >
                Decline
              </Button>
              <Button
                className='text-white'
                onClick={() => acceptMutation.mutate({ token: inviteToken || '' })}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                Accept &amp; Join
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-destructive">
            Invitation not found or expired.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
