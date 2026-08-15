import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleApis } from '@/api/services/role.api';

export function useUpdateMemberRole(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      roleApis.updateMemberRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success('Member role updated successfully');
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(responseData?.message || 'Failed to update role');
    },
  });
}
