import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProjectStatusConfig } from "@/features/project/utils/project-status-style";
import type { IProjectResponse } from "@/features/project/types";

interface ProjectDetailHeaderProps {
  project: IProjectResponse;
  onNewTaskClick: () => void;
}

export function ProjectDetailHeader({ project, onNewTaskClick }: ProjectDetailHeaderProps) {
  const statusConfig = getProjectStatusConfig(project.phase);

  return (
    <header className="mb-6">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground hover:text-foreground">
        <Link to="/projects" className="inline-flex items-center gap-1.5 font-medium">
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span>All projects</span>
        </Link>
      </Button>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div
              className="size-10 shrink-0 rounded-xl bg-gradient-brand shadow-glow grid place-items-center text-white font-bold text-sm"
              aria-hidden
            >
              {project.code?.slice(0, 3) || project.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight wrap-break-word">{project.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statusConfig.statusColor}>
                  {statusConfig.label}
                </Badge>
                {project.code && (
                  <Badge variant="secondary" className="text-xs font-normal font-mono">
                    {project.code}
                  </Badge>
                )}
                {project.priority && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {project.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {project.description && (
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          )}
        </div>

        <Button
          onClick={onNewTaskClick}
          className="w-full sm:w-auto bg-gradient-brand text-white hover:opacity-90 shadow-glow"
        >
          <Plus className="size-4 mr-1" aria-hidden /> New task
        </Button>
      </div>
    </header>
  );
}
