import { useQuery } from '@tanstack/react-query';
import { invitationApi, type InvitationItem } from '@/api/services/invitation.api';

export function useMyPendingInvitations() {
  const query = useQuery({
    queryKey: ['my-pending-invitations'],
    queryFn: () => invitationApi.myPending(),
  });

  const rawData = query.data;
  const invitations: InvitationItem[] = Array.isArray(rawData)
    ? rawData
    : (rawData as any)?.data ?? [];

  return { ...query, invitations };
}
