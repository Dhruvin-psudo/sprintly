import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ICreateProjectPayload } from "../types";
import { projectApis } from "@/api/services/project.api";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateProjectPayload) => projectApis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create project";
      toast.error(typeof message === "string" ? message : JSON.stringify(message));
    },  
  });
}
