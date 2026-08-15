import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleApis } from '@/api/services/role.api';

export function useRemoveOrgMember(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => roleApis.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success('Member removed from organization');
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(responseData?.message || 'Failed to remove member');
    },
  });
}
