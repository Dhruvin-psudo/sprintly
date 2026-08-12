export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DUE' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskUser {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
}

export interface TaskProject {
    id: string;
    name: string;
    code?: string | null;
}

export interface Task {
    id: string;
    organizationId: string;
    projectId: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assigneeId?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    project?: TaskProject;
    assignee?: TaskUser | null;
    createdByUser?: TaskUser | null;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate: string | Date;
    assigneeId?: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | Date | null;
    assigneeId?: string | null;
}

export interface TaskQueryParams {
    projectId?: string;
    assigneeId?: string;
    myTasksOnly?: boolean;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
