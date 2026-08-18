import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi } from '@/api/services/invitation.api';

export function useDeclinePendingInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationApi.declineForUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
      toast.success('Invitation declined');
    },
    onError: () => toast.error('This invitation is no longer available'),
  });
}
