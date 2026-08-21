import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IProjectResponse } from "@/features/project/types";
import { getProjectStatusConfig } from "@/features/project/utils/project-status-style";

interface ActiveProjectsProps {
  data?: IProjectResponse[];
}

export function ActiveProjects({ data = [] }: ActiveProjectsProps) {
  const navigate = useNavigate();

  // Show at most 3 projects in single-column vertical layout to match former calendar width
  const displayProjects = data.slice(0, 3);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active projects</CardTitle>
          <CardDescription>Projects currently in progress</CardDescription>
        </div>
        <Button
          variant="link"
          onClick={() => navigate("/projects")}
          className="text-primary h-auto p-0 font-normal cursor-pointer"
        >
          View all
        </Button>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {displayProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
            <p className="text-sm">No active projects</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayProjects.map((project) => {
              const statusConfig = getProjectStatusConfig(project.phase);
              const progress = project.progress ?? 0;
              const formattedDate = project.dueDate
                ? new Date(project.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
                : "No due date";

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="p-3.5 rounded-xl border border-border bg-card/50 space-y-3 hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {project.code && (
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                          {project.code}
                        </p>
                      )}
                      <h4 className="font-semibold text-sm line-clamp-1">{project.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border ${statusConfig.statusColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress}% complete</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

