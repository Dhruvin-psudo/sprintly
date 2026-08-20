import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApis } from "@/api/services/project.api";
import type { IUpdateProjectPayload } from "../types";
import { toast } from "sonner";

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateProjectPayload) => projectApis.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error.response?.data?.message || error.message || "Failed to update project";
      toast.error(message);
    },
  });
}
