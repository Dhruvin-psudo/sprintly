import { setAccessToken } from "@/api";
import { organizationApi } from "@/api/services/organization.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSwitchOrganization() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (organizationId: string) => organizationApi.switch(organizationId),
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.clear();
            toast.success('Switched Organization');
            window.location.replace('/dashboard');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to switch organization";
            toast.error(typeof message === "string" ? message : JSON.stringify(message));
        },
    })
}