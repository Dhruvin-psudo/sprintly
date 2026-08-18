import { apiClient } from '../client';
import { API_ENDPOINTS } from '../constant/endpoints';
import type { IApiResponse } from '../types';

export interface IRole {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

export const roleApis = {
  all: () =>
    apiClient
      .get<IApiResponse<IRole[]> & { data: IRole[] | { data: IRole[] } }>(
        API_ENDPOINTS.ROLE.ALL
      )
      .then((r) => {
        const d = r.data.data;
        if (Array.isArray(d)) return d;
        if (d && 'data' in d && Array.isArray((d as { data: IRole[] }).data)) {
          return (d as { data: IRole[] }).data;
        }
        return [];
      }),

  updateMemberRole: (userId: string, roleId: string) =>
    apiClient.patch<void>(API_ENDPOINTS.ROLE.ASSIGN, { userId, roleId }).then((r) => r.data),

  removeMember: (userId: string) =>
    apiClient.delete<void>(API_ENDPOINTS.ROLE.REMOVE_MEMBER, { data: { userId } }).then((r) => r.data),
};
