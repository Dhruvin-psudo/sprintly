import type { IProjectCardResponse } from "../types";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
  readonly projects: IProjectCardResponse[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
