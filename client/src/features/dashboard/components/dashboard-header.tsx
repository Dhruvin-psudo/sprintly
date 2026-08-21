import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";

export function DashboardHeader() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: user } = useCurrentUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const name = user?.firstName || "there";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening across your workspace today.
        </p>
      </div>
      <CreateProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-brand text-white hover:opacity-90 shadow-glow cursor-pointer"
        >
          <Plus className="size-4" /> New project
        </Button>
      </CreateProjectDialog>
    </div>
  );
}

