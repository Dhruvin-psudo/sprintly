import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invitationApi } from '@/api/services/invitation.api';
import { useOrganizationTransition } from '@/features/organization/hooks/use-organization-transition';

export function useAcceptPendingInvitation(options?: { onSuccess?: () => void }) {
  const transitionOrganization = useOrganizationTransition();

  return useMutation({
    mutationFn: (id: string) => invitationApi.acceptForUser(id),
    onSuccess: async (result) => {
      await transitionOrganization(result.accessToken);
      toast.success('Invitation accepted successfully');
      options?.onSuccess?.();
    },
    onError: () => toast.error('This invitation is no longer available'),
  });
}
