import { setAccessToken } from "@/api";
import { organizationApi } from "@/api/services/organization.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ORGANIZATION_QUERY_KEYS } from "../constants/organization.constants";

export function useSwitchOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (organizationId: string) => organizationApi.switch(organizationId),
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.clear();
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