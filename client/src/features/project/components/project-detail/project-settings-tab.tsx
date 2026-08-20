import { Settings } from "lucide-react";

export function ProjectSettingsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Project settings</h2>
        <p className="text-xs text-muted-foreground">Manage project details, preferences, and configurations.</p>
      </div>

      <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center text-muted-foreground">
        <Settings className="size-10 mx-auto mb-3 opacity-40" />
        <h3 className="font-semibold text-foreground text-base">Settings</h3>
        <p className="text-xs mt-1 max-w-sm mx-auto">This section will be implemented in the next iteration.</p>
      </div>
    </div>
  );
}
