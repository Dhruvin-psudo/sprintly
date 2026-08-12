import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/api/services/task.api';
import { toast } from 'sonner';

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
            taskApi.delete({ projectId, id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || err.message || 'Failed to delete task';
            toast.error(message);
        },
    });
}
