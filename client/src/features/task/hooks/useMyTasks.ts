import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/api/services/task.api';
import type { TaskQueryParams } from '../types';

export function useMyTasks(params?: TaskQueryParams) {
    return useQuery({
        queryKey: ['tasks', 'my-projects', params],
        queryFn: () => taskApi.listMemberProjects(params),
    });
}

export function useAssignedMeTasks(params?: TaskQueryParams) {
    return useQuery({
        queryKey: ['tasks', 'assigned-me', params],
        queryFn: () => taskApi.listAssignedToMe(params),
    });
}
