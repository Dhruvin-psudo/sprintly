import type {
  ICreateOrganizationRequest,
  ICreateOrganizationResponse,
} from "@/features/organization/types";
import { apiClient } from "../client";
import type { IApiResponse } from "../types";
import { API_ENDPOINTS } from "../constant/endpoints";

export const createOrganization = (data: ICreateOrganizationRequest) =>
  apiClient
    .post<IApiResponse<ICreateOrganizationResponse>>(
      API_ENDPOINTS.ORGANIZATION.CREATE,
      data
    )
    .then((r) => r.data.data);
