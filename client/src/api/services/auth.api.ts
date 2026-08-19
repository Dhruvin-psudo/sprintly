import type { ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse } from "@/features/auth/types";
import { apiClient } from "../client";
import type { IApiResponse } from "../types";
import { API_ENDPOINTS } from "../constant/endpoints";
import type { IOrganization } from '@/features/organization/types';

export interface SessionContextResponse {
    hasOrganization: boolean;
    contextMatches: boolean;
    activeOrganizationId: string | null;
    activeRoleId: string | null;
    organizations: IOrganization[];
}

export interface SessionReconcileResponse {
    accessToken: string;
    hasOrganization: boolean;
    removedFromActiveOrganization: boolean;
    organizations: IOrganization[];
}

export const login = (data: ILoginRequest) =>
    apiClient
        .post<IApiResponse<ILoginResponse>>(API_ENDPOINTS.AUTH.LOGIN, data)
        .then((r) => r.data.data);

export const register = (data: IRegisterRequest) =>
    apiClient
        .post<IApiResponse<IRegisterResponse>>(API_ENDPOINTS.AUTH.REGISTER, data)
        .then((r) => r.data.data);

export const logout = () =>
    apiClient.post<IApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT).then((r) => r.data.data);

export const getSessionContext = () =>
    apiClient.get<IApiResponse<SessionContextResponse>>(API_ENDPOINTS.AUTH.SESSION_CONTEXT)
        .then((r) => r.data.data);

export const reconcileSession = () =>
    apiClient.post<IApiResponse<SessionReconcileResponse>>(API_ENDPOINTS.AUTH.SESSION_RECONCILE)
        .then((r) => r.data.data);
