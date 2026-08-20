import type { Task } from "@/features/task/types";

/**
 * Calculates the workload percentage for a specific user within a project.
 * Workload is calculated as the ratio of active (non-COMPLETED) tasks assigned
 * to this member relative to all active tasks in the project.
 */
export function calculateWorkload(memberUserId: string, tasks: Task[] = []): number {
  if (!tasks.length) return 0;

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");
  if (!activeTasks.length) return 0;

  const memberActiveTasks = activeTasks.filter((t) => t.assigneeId === memberUserId);

  return Math.round((memberActiveTasks.length / activeTasks.length) * 100);
}
