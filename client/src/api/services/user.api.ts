import type { IUser } from "@/features/auth/types";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../constant/endpoints";
import type { IApiResponse, IPaginatedResponse } from "../types";

export interface IListUsersParams {
    readonly page?: number;
    readonly limit?: number;
    readonly search?: string;
}

export const getMe = () =>
    apiClient.get<IApiResponse<IUser>>(API_ENDPOINTS.USER.ME).then((r) => r.data.data);
  

// Later move to members.api this is for temparory
export const getAllOrgMembers = (params? : IListUsersParams) : Promise<IPaginatedResponse<IUser>> =>
    apiClient
      .get<IApiResponse<IUser[]> & { meta: IPaginatedResponse<IUser> }>
      (API_ENDPOINTS.USER.ALL, { params })
      .then((r) => ({        
        data: r.data.data,
        page: r.data.meta.page,
        limit: r.data.meta.limit,
        total: r.data.meta.total,
        totalPages: r.data.meta.totalPages,
      }));
