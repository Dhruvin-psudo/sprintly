import type { TaskStatus } from '../types';
import { AlertCircle, CheckCircle2, Circle, Clock, Eye } from 'lucide-react';
import React from 'react';

export interface StatusConfig {
    label: string;
    badgeClassName: string;
    containerClassName: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
    TODO: {
        label: 'To Do',
        badgeClassName: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        containerClassName: 'bg-muted/20 border-border/40',
        icon: Circle,
    },
    IN_PROGRESS: {
        label: 'In Progress',
        badgeClassName: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        containerClassName: 'bg-muted/20 border-border/40',
        icon: Clock,
    },
    REVIEW: {
        label: 'Review',
        badgeClassName: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        containerClassName: 'bg-muted/20 border-border/40',
        icon: Eye,
    },
    DUE: {
        label: 'Dues',
        badgeClassName: 'bg-rose-500 text-white font-bold dark:bg-rose-600',
        containerClassName: 'bg-rose-500/5 border-rose-200 dark:border-rose-950',
        icon: AlertCircle,
    },
    COMPLETED: {
        label: 'Completed',
        badgeClassName: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        containerClassName: 'bg-muted/30 border-border/60',
        icon: CheckCircle2,
    },
};

export function getStatusConfig(status: TaskStatus): StatusConfig {
    return STATUS_CONFIG[status] || STATUS_CONFIG.TODO;
}
