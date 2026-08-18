import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi } from '@/api/services/invitation.api';
import { setAccessToken } from '@/api';

export function useAcceptPendingInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationApi.acceptForUser(id),
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      queryClient.clear();
      toast.success('Invitation accepted successfully');
    },
    onError: () => toast.error('This invitation is no longer available'),
  });
}
