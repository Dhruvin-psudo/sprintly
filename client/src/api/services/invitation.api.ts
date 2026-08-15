import { apiClient } from '../client';
import { API_ENDPOINTS } from '../constant/endpoints';
import type { IApiResponse } from '../types';

export interface SendInvitationInput {
  email?: string;
  emails?: string[];
  roleId: string;
}

export interface SendInvitationResponse {
  sentCount: number;
  errorsCount: number;
  message: string;
}

export interface AcceptInvitationInput {
  token: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

export interface InvitationQueryInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED';
}

export interface InvitationItem {
  id: string;
  email: string;
  token?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  invitedByUser: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
}

export interface VerifiedInvitationDetails {
  id: string;
  email: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: {
    id: string;
    name: string;
  };
  expiresAt: string;
  inviter: {
    id: string;
    firstName: string;
    lastName?: string;
  };
  isRegistered: boolean;
}

function unwrapResponse<T>(resData: IApiResponse<T> | T): T {
  if (resData && typeof resData === 'object' && 'data' in resData) {
    return (resData as IApiResponse<T>).data;
  }
  return resData as T;
}

export const invitationApi = {
  send: (data: SendInvitationInput) =>
    apiClient.post<IApiResponse<SendInvitationResponse>>(API_ENDPOINTS.INVITATION.SEND, data).then((r) => unwrapResponse(r.data)),

  list: (params?: InvitationQueryInput) =>
    apiClient.get<IApiResponse<InvitationItem[]>>(API_ENDPOINTS.INVITATION.ALL, { params }).then((r) => {
      const unwrapped = unwrapResponse(r.data);
      return Array.isArray(unwrapped) ? unwrapped : [];
    }),

  verify: (token: string) =>
    apiClient.get<IApiResponse<VerifiedInvitationDetails>>(API_ENDPOINTS.INVITATION.VERIFY(token)).then((r) => unwrapResponse(r.data)),

  accept: (data: AcceptInvitationInput) =>
    apiClient.post<IApiResponse<{ accessToken: string; hasOrganization: boolean }>>(API_ENDPOINTS.INVITATION.ACCEPT, data).then((r) => unwrapResponse(r.data)),

  revoke: (id: string) =>
    apiClient.delete<IApiResponse<void>>(API_ENDPOINTS.INVITATION.REVOKE(id)).then((r) => unwrapResponse(r.data)),

  resend: (id: string) =>
    apiClient.post<IApiResponse<InvitationItem>>(API_ENDPOINTS.INVITATION.RESEND(id)).then((r) => unwrapResponse(r.data)),

  decline: (token: string) =>
    apiClient.post<IApiResponse<void>>(API_ENDPOINTS.INVITATION.DECLINE, { token }).then((r) => unwrapResponse(r.data)),

  myPending: () =>
    apiClient.get<IApiResponse<InvitationItem[]>>(API_ENDPOINTS.INVITATION.MY_PENDING).then((r) => {
      const unwrapped = unwrapResponse(r.data);
      return Array.isArray(unwrapped) ? unwrapped : [];
    }),
};
