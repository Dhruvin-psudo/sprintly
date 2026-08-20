import { CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { IProjectCardResponse } from "../types";

interface ProjectCardProps {
  project: IProjectCardResponse;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progressPercent = project.progress ?? 0;

  return (
    <Link key={project.id} to={`/projects/${project.id}`} className="rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors block">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
        <h3 className="font-semibold truncate mt-0.5">{project.name}</h3>
      </div>
    
      <p className="text-sm text-muted-foreground mt-3 line-clamp-2 h-10">
        {project.description}
      </p>
      
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-muted overflow-hidden rounded-full">
          <div 
            className="h-full bg-gradient-brand transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}  
          />
        </div>
      </div>
        
      <div className="flex items-center justify-between mt-4">
        <Badge variant="outline" className={`font-normal ${project.statusColor}`}>
          {project.status}
        </Badge>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1"><Users className="size-3" />{project.memberCount}</span>
          <span className="flex items-center gap-1"><CalendarDays className="size-3" />{project.dueDate}</span>
        </div>
      </div>
    </Link>
  );
}
