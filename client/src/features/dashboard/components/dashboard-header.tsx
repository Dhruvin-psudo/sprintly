import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning, Ava</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening across Nebula Studio today.
        </p>
      </div>
      <Button className="bg-gradient-brand text-white hover:opacity-90 shadow-glow">
        <Plus className="size-4"/> New task
      </Button>
    </div>
  );
}
