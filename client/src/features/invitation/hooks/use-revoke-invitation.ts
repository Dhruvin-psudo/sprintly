import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi } from '@/api/services/invitation.api';

export function useRevokeInvitation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invitationApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation revoked successfully.');
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(responseData?.message || 'Failed to revoke invitation.');
    },
  });
}
