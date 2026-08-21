import { apiClient } from '../client';
import { API_ENDPOINTS } from '../constant/endpoints';
import type { IApiResponse } from '../types';
import type { ProductivityDayData, IDashboardStatsResponse } from '@/features/dashboard/types';

export const dashboardApi = {
    getProductivityData: (days: number = 7) =>
        apiClient
            .get<IApiResponse<ProductivityDayData[]>>(API_ENDPOINTS.DASHBOARD.PRODUCTIVITY, {
                params: { days },
            })
            .then((r) => r.data.data),

    getStats: () =>
        apiClient
            .get<IApiResponse<IDashboardStatsResponse>>(API_ENDPOINTS.DASHBOARD.STATS)
            .then((r) => r.data.data),
};

