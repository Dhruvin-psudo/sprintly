import type {
  IOrganization,
  ICreateOrganizationRequest,
  ICreateOrganizationResponse,
} from "@/features/organization/types";
import { apiClient } from "../client";
import type { IApiResponse } from "../types";
import { API_ENDPOINTS } from "../constant/endpoints";

export const organizationApi = {
  getCurrent: () =>
    apiClient
      .get<IApiResponse<IOrganization>>(API_ENDPOINTS.ORGANIZATION.CURRENT)
      .then((r) => r.data.data),

  getAll: () =>
    apiClient
      .get<IApiResponse<IOrganization[]>>(API_ENDPOINTS.ORGANIZATION.ALL)
      .then((r) => r.data.data),

  create: (data : ICreateOrganizationRequest) =>
    apiClient
      .post<IApiResponse<ICreateOrganizationResponse>>(
        API_ENDPOINTS.ORGANIZATION.CREATE,
        data
      )
      .then((r) => r.data.data),

  switch: (organizationId : string) =>
    apiClient
      .post<IApiResponse<{accessToken: string}>>(API_ENDPOINTS.ORGANIZATION.SWITCH, {
        organizationId
      })
      .then((r) => r.data.data),    
}
