import { useState, useMemo } from 'react';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useProjectTasks } from './useProjectTasks';
import { useMyTasks } from './useMyTasks';

export function useTaskBoard() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Fetch projects via feature hook
    const { data: projectsData, isLoading: isProjectsLoading } = useProjects({ limit: 100 });

    const projects = useMemo(() => {
        const raw = projectsData?.data || [];
        return raw.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
        }));
    }, [projectsData]);

    // Fetch tasks for selected project or all user tasks
    const isAll = selectedProjectId === 'ALL';
    const projectTasksQuery = useProjectTasks(
        !isAll ? selectedProjectId : undefined,
        { search: searchQuery || undefined }
    );
    const myTasksQuery = useMyTasks({
        search: searchQuery || undefined,
        enabled: isAll,
    });

    const activeQuery = !isAll ? projectTasksQuery : myTasksQuery;
    const isTasksLoading = activeQuery.isLoading;
    const isLoading = isProjectsLoading || isTasksLoading;

    // Filter tasks if search is active
    const filteredTasks = useMemo(() => {
        const rawTasks = activeQuery.data?.data || [];
        if (!searchQuery.trim()) return rawTasks;
        const q = searchQuery.toLowerCase();
        return rawTasks.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q))
        );
    }, [activeQuery.data?.data, searchQuery]);

    const effectiveProjectId = !isAll
        ? selectedProjectId
        : projects.length > 0
        ? projects[0].id
        : undefined;

    // Formatted project label helper for select display
    const selectedProjectName = useMemo(() => {
        if (selectedProjectId === 'ALL') return 'All Projects';
        const found = projects.find((p) => p.id === selectedProjectId);
        return found ? `${found.name}${found.code ? ` (${found.code})` : ''}` : 'Select Project';
    }, [selectedProjectId, projects]);

    return {
        selectedProjectId,
        setSelectedProjectId,
        searchQuery,
        setSearchQuery,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        projects,
        filteredTasks,
        effectiveProjectId,
        selectedProjectName,
        isLoading,
    };
}
