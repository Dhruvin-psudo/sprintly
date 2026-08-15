import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi } from '@/api/services/invitation.api';

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invitationApi.resend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation link resent successfully!');
    },
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(responseData?.message || 'Failed to resend invitation link.');
    },
  });
}
