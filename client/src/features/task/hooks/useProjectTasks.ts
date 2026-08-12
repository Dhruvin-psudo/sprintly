import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/api/services/task.api';
import type { TaskQueryParams } from '../types';

export function useProjectTasks(projectId?: string, params?: TaskQueryParams) {
    return useQuery({
        queryKey: ['tasks', 'project', projectId, params],
        queryFn: () => taskApi.listByProject(projectId!, params),
        enabled: !!projectId,
    });
}
