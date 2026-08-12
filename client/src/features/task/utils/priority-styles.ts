import type { TaskPriority } from '../types';

export interface PriorityConfig {
    label: string;
    badgeClassName: string;
}

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
    LOW: {
        label: 'Low',
        badgeClassName: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
    MEDIUM: {
        label: 'Medium',
        badgeClassName: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    HIGH: {
        label: 'High',
        badgeClassName: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    URGENT: {
        label: 'Urgent',
        badgeClassName: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    },
};

export function getPriorityConfig(priority: TaskPriority): PriorityConfig {
    return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
}
