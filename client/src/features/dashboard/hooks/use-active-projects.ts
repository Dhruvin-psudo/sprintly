import { useProjects } from '@/features/project/hooks/use-projects';
import { ProjectPhase } from '@/features/project/types';

export function useActiveProjects(limit: number = 3) {
  return useProjects({
    phase: ProjectPhase.ACTIVE,
    limit,
  });
}
