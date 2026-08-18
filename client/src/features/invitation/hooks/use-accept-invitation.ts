import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi, type AcceptInvitationInput } from '@/api/services/invitation.api';
import { setAccessToken } from '@/api';
import { ORGANIZATION_QUERY_KEYS } from '@/features/organization/constants/organization.constants';

export function useAcceptInvitation(options?: { onSuccess?: (orgName?: string) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptInvitationInput) => invitationApi.accept(data),
    onSuccess: (res) => {
      setAccessToken(res.accessToken);
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.current });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation accepted successfully!');
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(responseData?.message || 'Failed to accept invitation.');
    },
  });
}
