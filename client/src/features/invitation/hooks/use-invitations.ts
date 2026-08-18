import { useQuery } from '@tanstack/react-query';
import { invitationApi, type InvitationQueryInput } from '@/api/services/invitation.api';

export function useInvitations(params?: InvitationQueryInput) {
  return useQuery({
    queryKey: ['invitations', params],
    queryFn: () => invitationApi.list(params),
    refetchInterval: 30_000,
  });
}
