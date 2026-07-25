import type { ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse } from "@/features/auth/types";
import { apiClient } from "../client";
import type { IApiResponse } from "../types";
import { API_ENDPOINTS } from "../constant/endpoints";

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