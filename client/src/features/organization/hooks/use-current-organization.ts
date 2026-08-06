import { useQuery } from "@tanstack/react-query";
import { ORGANIZATION_QUERY_KEYS } from "../constants/organization.constants";
import { organizationApi } from "@/api/services/organization.api";

export function useCurrentOrganization() {
    return useQuery({
        queryKey: ORGANIZATION_QUERY_KEYS.current,
        queryFn: organizationApi.getCurrent,
        staleTime: 5 * 60 * 1000
    })
}