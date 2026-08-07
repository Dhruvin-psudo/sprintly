import { Button } from "@/components/ui/button";
import { FolderPlus, SearchX, Plus, X } from "lucide-react";
import { CreateProjectDialog } from "./create-project-dialog";
import { useState } from "react";

interface ProjectEmptyStateProps {
  readonly isFiltered: boolean;
  readonly onClearFilters: () => void;
}

export function ProjectEmptyState({ isFiltered, onClearFilters }: ProjectEmptyStateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 lg:p-12 rounded-3xl border border-dashed border-border/80 bg-card/40 my-4">
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground border border-border/40">
          <SearchX className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight mb-1.5">
          No matching projects found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          We couldn't find any projects matching your current search term or filter criteria. Try adjusting or clearing your filters.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="h-9 px-4 border-border hover:bg-muted text-sm"
          >
            <X className="size-4 mr-2" /> Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 lg:p-14 rounded-3xl border border-dashed border-border/80 bg-card/40 my-4">
      <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 text-primary border border-primary/20 shadow-glow">
        <FolderPlus className="size-8 text-primary" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-2">
        No projects created yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        Get started by creating your first project to organize tasks, track progress, and collaborate seamlessly with your team.
      </p>
      <CreateProjectDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Button className="bg-gradient-brand text-white hover:opacity-90 shadow-glow h-10 px-5">
          <Plus className="size-4 mr-2" /> Create Project
        </Button>
      </CreateProjectDialog>
    </div>
  );
}
