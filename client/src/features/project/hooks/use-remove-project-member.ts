import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApis } from "@/api/services/project.api";
import { toast } from "sonner";

export function useRemoveProjectMember(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => projectApis.removeMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Member removed from project");
    },
    onError: () => {
      toast.error("Failed to remove member from project");
    },
  });
}
