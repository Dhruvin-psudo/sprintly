import { useQuery } from "@tanstack/react-query";
import { projectApis } from "@/api/services/project.api";

export function useProject(id?: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectApis.getById(id!),
    enabled: !!id,
  });
}
