import { useEffect, useMemo, useState } from "react";
import { OrderBy, type IProjectQuery, type IProjectResponse } from "../types";
import { useProjects } from "./use-projects";

const DEFAULT_QUERY: IProjectQuery = {
    page: 1
};

export function useProjectListState() {
    const [query, setQuery] = useState<IProjectQuery>(DEFAULT_QUERY);
    const [searchInput, setSearchInput] = useState('');

    const { data, isLoading, isFetching, error, refetch } = useProjects(query);

    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery((prev) => ({
                ...prev,
                search: searchInput || undefined,
                page: 1,
            }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const projects = useMemo(() => data?.data ?? [] as IProjectResponse[], [data?.data]);
    const pageCount = data?.totalPages ?? 0;
    const currentPage = (data?.page ?? 1) - 1; 

    function handleQueryChange(partial: Partial<IProjectQuery>) {
        setQuery((prev) => ({...prev, ...partial}));
    }

    function handleClearFilters() {
        setSearchInput('');
        setQuery({
            page: 1,
            sortBy: "createdAt",
            sortOrder: OrderBy.DESC,
        });
    }

    function handlePageChange(pageIndex: number) {
        setQuery((prev) => ({...prev, page: pageIndex + 1}))
    }

    const hasActiveFilters = Boolean(
        query.phase ||
        query.priority ||
        query.search ||
        searchInput
    );

    const isEmptyState = projects.length === 0 && !hasActiveFilters;

    return {
        // data
        projects,
        pageCount,
        currentPage,

        // Query
        query,
        handleQueryChange,
        handleClearFilters,
        handlePageChange,

        // search
        searchInput,
        setSearchInput,

        // state
        hasActiveFilters,
        isEmptyState,
        isLoading,
        isFetching,
        error,
        refetch,
    };
}