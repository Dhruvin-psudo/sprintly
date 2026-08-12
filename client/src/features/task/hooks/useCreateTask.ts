import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/api/services/task.api';
import type { CreateTaskInput } from '../types';
import { toast } from 'sonner';

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: CreateTaskInput }) =>
            taskApi.create({ projectId, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task created successfully');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || err.message || 'Failed to create task';
            toast.error(message);
        },
    });
}
