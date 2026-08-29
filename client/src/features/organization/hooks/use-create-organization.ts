import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { ICreateOrganizationRequest } from "../types";
import { ORGANIZATION_QUERY_KEYS } from "../constants/organization.constants";
import { organizationApi } from "@/api/services/organization.api";
import { setAccessToken } from "@/api";
import { PRIVATE_ROUTES } from "@/router/constants/routes";
import { toast } from "sonner";
import axios from "axios";

export function useCreateOrganization(options?: { navigateOnSuccess?: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const navigateOnSuccess = options?.navigateOnSuccess ?? true;

  return useMutation({
    mutationFn: (data: ICreateOrganizationRequest) => organizationApi.create(data),
    onSuccess: (response) => {
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.current });
      if (navigateOnSuccess) {
        navigate(PRIVATE_ROUTES.DASHBOARD);
      }
      toast.success("Organization created successfully");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ?? "Failed to create organization";
        toast.error(Array.isArray(message) ? message[0] : message);
      } else {
        toast.error("Failed to create organization");
      }
    },
  });
}
