import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/api/services/task.api';
import type { TaskQueryParams } from '../types';

export function useMyTasks(params?: TaskQueryParams & { enabled?: boolean }) {
    const { enabled = true, ...queryParams } = params ?? {};
    return useQuery({
        queryKey: ['tasks', 'my-projects', queryParams],
        queryFn: () => taskApi.listMemberProjects(queryParams),
        enabled,
    });
}

export function useAssignedMeTasks(params?: TaskQueryParams) {
    return useQuery({
        queryKey: ['tasks', 'assigned-me', params],
        queryFn: () => taskApi.listAssignedToMe(params),
    });
}
