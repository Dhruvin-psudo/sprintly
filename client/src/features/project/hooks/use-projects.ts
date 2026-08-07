import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { projectApis } from "@/api/services/project.api";
import type { IProjectQuery } from "../types";

export function useProjects(params?: IProjectQuery) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApis.all(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}