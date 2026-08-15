import { useQuery } from '@tanstack/react-query';
import { invitationApi } from '@/api/services/invitation.api';

export function useVerifyInvitation(token: string, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ['verify-invitation', token],
    queryFn: () => invitationApi.verify(token),
    enabled: enabled && !!token,
    retry: false,
  });

  const rawData = query.data;
  const invitation = (rawData as any)?.data ?? rawData;

  return { ...query, invitation };
}
