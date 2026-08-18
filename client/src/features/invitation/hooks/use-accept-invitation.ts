import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi, type AcceptInvitationInput } from '@/api/services/invitation.api';
import { useOrganizationTransition } from '@/features/organization/hooks/use-organization-transition';

export function useAcceptInvitation(options?: { onSuccess?: (orgName?: string) => void }) {
  const transitionOrganization = useOrganizationTransition();

  return useMutation({
    mutationFn: (data: AcceptInvitationInput) => invitationApi.accept(data),
    onSuccess: async (res) => {
      await transitionOrganization(res.accessToken);
      toast.success('Invitation accepted successfully!');
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(responseData?.message || 'Failed to accept invitation.');
    },
  });
}
