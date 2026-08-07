import type { ICreateProjectPayload, IProjectQuery, IProjectResponse } from "@/features/project/types";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../constant/endpoints";
import type { IApiResponse, IPaginatedResponse } from "../types";
    
export const projectApis = {
  create: (data: ICreateProjectPayload) => 
    apiClient
      .post<IApiResponse<IProjectResponse>>(
        API_ENDPOINTS.PROJECT.CREATE,
        data
      )
      .then((r) => r.data.data),

  all: (params?: IProjectQuery): Promise<IPaginatedResponse<IProjectResponse>> => 
    apiClient
      .get<IApiResponse<IProjectResponse[]> & { meta: IPaginatedResponse<IProjectResponse> }>(
        API_ENDPOINTS.PROJECT.ALL,
        { params }
      )
      .then((r) => ({
        data: r.data.data ?? [],
        page: r.data.meta?.page ?? 1,
        limit: r.data.meta?.limit ?? 20,
        total: r.data.meta?.total ?? 0,
        totalPages: r.data.meta?.totalPages ?? (r.data.meta as any)?.totalPage ?? 1,
      })),

  getById: (id: string) => 
    apiClient
      .get<IApiResponse<IProjectResponse>>(
        API_ENDPOINTS.PROJECT.BY_ID(id)
      )
      .then((r) => r.data.data),
};
