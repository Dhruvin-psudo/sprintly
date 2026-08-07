import { getAccessToken } from "@/api";
import { getMe } from "@/api/services/user.api";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
    const token = getAccessToken();

    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: getMe,
        enabled: !!token,
        staleTime: 5 * 60 * 1000
    })
}