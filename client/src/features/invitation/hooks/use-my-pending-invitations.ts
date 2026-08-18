import { useQuery } from '@tanstack/react-query';
import { invitationApi, type InvitationItem } from '@/api/services/invitation.api';

export function useMyPendingInvitations() {
  const query = useQuery({
    queryKey: ['my-pending-invitations'],
    queryFn: () => invitationApi.myPending(),
    refetchInterval: 30_000,
  });

  const invitations: InvitationItem[] = query.data ?? [];

  return { ...query, invitations };
}
