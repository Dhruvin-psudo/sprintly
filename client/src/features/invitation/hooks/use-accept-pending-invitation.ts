import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi } from '@/api/services/invitation.api';
import { setAccessToken } from '@/api';
import { ORGANIZATION_QUERY_KEYS } from '@/features/organization/constants/organization.constants';

export function useAcceptPendingInvitation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationApi.acceptForUser(id),
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.current });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation accepted successfully');
      options?.onSuccess?.();
    },
    onError: () => toast.error('This invitation is no longer available'),
  });
}
