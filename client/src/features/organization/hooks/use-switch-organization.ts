import { organizationApi } from "@/api/services/organization.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ORGANIZATION_QUERY_KEYS } from "@/features/organization/constants/organization.constants";
import { useOrganizationTransition } from "./use-organization-transition";

export function useSwitchOrganization() {
    const queryClient = useQueryClient();
    const transitionOrganization = useOrganizationTransition();

    return useMutation({
        mutationFn: (organizationId: string) => organizationApi.switch(organizationId),
        onSuccess: async (data) => {
            await transitionOrganization(data.accessToken);
            toast.success('Switched Organization');
            window.location.replace('/dashboard');
        },
        onError: (error: unknown) => {
            queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to switch organization";
            toast.error(typeof message === "string" ? message : JSON.stringify(message));
        },
    });
}