import { apiClient } from '../client';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskQueryParams } from '@/features/task/types';
import type { IPaginatedResponse } from '../types';

export const taskApi = {
    listByProject: (projectId: string, params?: TaskQueryParams) =>
        apiClient.get<IPaginatedResponse<Task>>(`/project/${projectId}/task`, { params }).then((r) => r.data),

    listAssignedToMe: (params?: TaskQueryParams) =>
        apiClient.get<IPaginatedResponse<Task>>('/task/assigned-me', { params }).then((r) => r.data),

    listMemberProjects: (params?: TaskQueryParams) =>
        apiClient.get<IPaginatedResponse<Task>>('/task/my-projects', { params }).then((r) => r.data),

    getById: (projectId: string, id: string) =>
        apiClient.get<Task>(`/project/${projectId}/task/${id}`).then((r) => r.data),

    create: ({ projectId, data }: { projectId: string; data: CreateTaskInput }) =>
        apiClient.post<Task>(`/project/${projectId}/task`, data).then((r) => r.data),

    update: ({ projectId, id, data }: { projectId: string; id: string; data: UpdateTaskInput }) =>
        apiClient.patch<Task>(`/project/${projectId}/task/${id}`, data).then((r) => r.data),

    delete: ({ projectId, id }: { projectId: string; id: string }) =>
        apiClient.delete<Task>(`/project/${projectId}/task/${id}`).then((r) => r.data),
};
