import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/services/dashboard.api';

export function useProductivityData(days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', 'productivity', days],
    queryFn: () => dashboardApi.getProductivityData(days),
  });
}
