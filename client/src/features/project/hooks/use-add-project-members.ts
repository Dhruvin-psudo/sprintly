import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApis } from "@/api/services/project.api";
import { toast } from "sonner";

export function useAddProjectMembers(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => projectApis.addMembers(projectId!, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Project members added successfully");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error.response?.data?.message || error.message || "Failed to add project members";
      toast.error(message);
    },
  });
}
