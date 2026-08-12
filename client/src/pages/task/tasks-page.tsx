import { useTaskBoard } from '@/features/task/hooks/useTaskBoard';
import { TaskKanbanBoard } from '@/features/task/components/task-kanban-board';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';

export function TasksPage() {
    const {
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
    } = useTaskBoard();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6 w-full max-w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Board</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Drag tasks between columns to update their status.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 shadow-glow text-white font-medium"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="size-4" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1 shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Filter tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm h-9 bg-card"
                        />
                    </div>

                    {/* Project Selector */}
                    <div className="w-full sm:w-56">
                        <Select
                            value={selectedProjectId}
                            onValueChange={(val) => val && setSelectedProjectId(val)}
                        >
                            <SelectTrigger className="text-sm rounded-md shadow-sm border border-input h-9 bg-card">
                                <SelectValue>{selectedProjectName}</SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                                <SelectItem value="ALL">All Projects</SelectItem>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} {p.code ? `(${p.code})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-1 self-end sm:self-center">
                    <Filter className="size-3.5" />
                    <span>{filteredTasks.length} tasks</span>
                </div>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 min-h-0 w-full overflow-x-auto">
                <TaskKanbanBoard
                    projectId={effectiveProjectId}
                    projects={projects}
                    tasks={filteredTasks}
                    isLoading={isLoading}
                    isCreateDialogOpen={isCreateDialogOpen}
                    onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
                />
            </div>
        </div>
    );
}
