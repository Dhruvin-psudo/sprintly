import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi, type SendInvitationInput } from '@/api/services/invitation.api';

export function useSendInvitation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendInvitationInput) => invitationApi.send(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
      toast.success(res.message || 'Invitations sent successfully!');
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: { message?: string; details?: Record<string, string[]> } } })?.response?.data;
      const detailMsg = errData?.details ? Object.values(errData.details).flat().join(' ') : null;
      toast.error(detailMsg || errData?.message || 'Failed to send invitations.');
    },
  });
}
