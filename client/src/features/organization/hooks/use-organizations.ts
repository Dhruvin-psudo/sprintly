import { useQuery } from "@tanstack/react-query";
import { ORGANIZATION_QUERY_KEYS } from "../constants/organization.constants";
import { organizationApi } from "@/api/services/organization.api";

export function useOrganizations() {
    return useQuery({
        queryKey: ORGANIZATION_QUERY_KEYS.all,
        queryFn: organizationApi.getAll,
        staleTime: 5 * 60 * 1000,
    })
}