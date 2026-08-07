import { ProjectHeader } from "./components/project-header";
import { ProjectList } from "./components/project-list";
import { ProjectListSkeleton } from "./components/project-list-skeleton";
import { ProjectEmptyState } from "./components/project-empty-state";
import { useProjectListState } from "./hooks/use-project-list-state";
import { getProjectStatusConfig } from "./utils/project-status-style";
import type { IProjectCardResponse, IProjectResponse } from "./types";

export function ProjectListContainer() {
  const { 
      projects,
      // pageCount,
      // currentPage,
      query,
      handleQueryChange,
      handleClearFilters,
      // handlePageChange,
      searchInput,
      setSearchInput,
      hasActiveFilters,
      isLoading,
      isFetching,
      // error,
      // refetch,
  } = useProjectListState();

  const cardProjects: IProjectCardResponse[] = (projects && projects.length > 0)
    ? projects.map((p: IProjectResponse) => {
        const statusConfig = getProjectStatusConfig(p.phase);

        return {
          id: p.id,
          name: p.name,
          code: p.code,
          description: p.description || "",
          progress: p.progress ?? 0,
          status: statusConfig.label,
          statusColor: statusConfig.statusColor,
          memberCount: p.members?.length || p._count?.members || 1,
          dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "No due date",
        };
      })
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col space-y-8">
      <ProjectHeader
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        query={query}
        onQueryChange={handleQueryChange}
        onClearFilters={handleClearFilters}
      />
      {isLoading ? (
        <ProjectListSkeleton hideHeader />
      ) : cardProjects.length === 0 ? (
        <ProjectEmptyState
          isFiltered={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div className={`transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
          <ProjectList projects={cardProjects} />
        </div>
      )}
    </div>
  );
}
