import { useQuery } from '@tanstack/react-query';
import { roleApis } from '@/api/services/role.api';

export function useRoles(enabled: boolean = true) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApis.all(),
    enabled,
  });
}
