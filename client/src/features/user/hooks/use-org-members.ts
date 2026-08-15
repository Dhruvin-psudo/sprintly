import { useQuery } from '@tanstack/react-query';
import { getAllOrgMembers, type IListUsersParams } from '@/api/services/user.api';

export function useOrgMembers(params?: IListUsersParams) {
  return useQuery({
    queryKey: ['workspace-members', params?.search],
    queryFn: () => getAllOrgMembers(params),
  });
}
