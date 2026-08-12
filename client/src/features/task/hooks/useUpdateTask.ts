import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/api/services/task.api';
import type { UpdateTaskInput } from '../types';
import { toast } from 'sonner';

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, id, data }: { projectId: string; id: string; data: UpdateTaskInput }) =>
            taskApi.update({ projectId, id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || err.message || 'Failed to update task';
            toast.error(message);
        },
    });
}
