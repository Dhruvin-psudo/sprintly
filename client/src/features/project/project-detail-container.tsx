import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useProject } from "./hooks/use-project";
import { useProjectTasks } from "@/features/task/hooks/useProjectTasks";
import { useCreateTask } from "@/features/task/hooks/useCreateTask";
import { CreateTaskDialog } from "@/features/task/components/create-task-dialog";
import { ProjectDetailHeader } from "./components/project-detail/project-detail-header";
import { ProjectOverviewTab } from "./components/project-detail/project-overview-tab";
import { ProjectTasksTab } from "./components/project-detail/project-tasks-tab";
import { ProjectCalendarTab } from "./components/project-detail/project-calendar-tab";
import { ProjectMembersTab } from "./components/project-detail/project-members-tab";
import { ProjectActivityTab } from "./components/project-detail/project-activity-tab";
import { ProjectSettingsTab } from "./components/project-detail/project-settings-tab";

const TABS = ["Overview", "Tasks", "Calendar", "Members", "Activity", "Settings"] as const;

export function ProjectDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProject(id);
  const { data: tasksData, isLoading: isTasksLoading } = useProjectTasks(id);
  const createTaskMutation = useCreateTask();

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const tasks = tasksData?.data ? Array.from(tasksData.data) : [];

  if (isProjectLoading || isTasksLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-100 w-full rounded-2xl" />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto text-center space-y-4 py-16">
        <h2 className="text-xl font-bold">Project not found</h2>
        <p className="text-sm text-muted-foreground">The project you are looking for does not exist or has been removed.</p>
        <Button asChild variant="outline">
          <Link to="/projects">
            <ArrowLeft className="size-4 mr-2" /> Back to projects
          </Link>
        </Button>
      </div>
    );
  }

  const projectForTaskDialog = [
    {
      id: project.id,
      name: project.name,
      code: project.code,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <ProjectDetailHeader
        project={project}
        onNewTaskClick={() => setIsCreateTaskOpen(true)}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max" aria-label="Project sections">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t.toLowerCase()}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <ProjectOverviewTab project={project} tasks={tasks} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <ProjectTasksTab projectId={project.id} tasks={tasks} onNewTaskClick={() => setIsCreateTaskOpen(true)} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ProjectCalendarTab projectId={project.id} tasks={tasks} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <ProjectMembersTab project={project} tasks={tasks} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ProjectActivityTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProjectSettingsTab />
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      <CreateTaskDialog
        open={isCreateTaskOpen}
        defaultProjectId={project.id}
        projects={projectForTaskDialog}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={({ projectId, data }) => {
          createTaskMutation.mutate(
            { projectId, data },
            {
              onSuccess: () => setIsCreateTaskOpen(false),
            }
          );
        }}
        isPending={createTaskMutation.isPending}
      />
    </div>
  );
}
