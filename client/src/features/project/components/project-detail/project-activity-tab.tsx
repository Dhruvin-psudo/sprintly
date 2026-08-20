import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_GROUPS, PROJECT_ACTIVITY_FULL } from "../../project-detail-data";
import { Activity } from "lucide-react";

const ACTIVITY_FILTER_LABELS: Record<string, string> = {
  all: "All activity",
  task: "Tasks",
  status: "Status changes",
  member: "Members",
  edit: "Project edits",
};

export function ProjectActivityTab() {
  const [filter, setFilter] = useState("all");

  const list = PROJECT_ACTIVITY_FULL.filter((a) => filter === "all" || a.kind === filter);

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Activity</h2>
          <p className="text-xs text-muted-foreground">Recent activity and changes in this project.</p>
        </div>
        <Select value={filter} onValueChange={(val) => { if (val) setFilter(val); }}>
          <SelectTrigger className="w-45">
            <SelectValue>{ACTIVITY_FILTER_LABELS[filter] || "All activity"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="status">Status changes</SelectItem>
            <SelectItem value="member">Members</SelectItem>
            <SelectItem value="edit">Project edits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Activity className="size-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-sm">No activity for this filter</p>
          </div>
        ) : (
          <div className="space-y-7">
            {ACTIVITY_GROUPS.map((g) => {
              const items = list.filter((a) => a.group === g);
              if (items.length === 0) return null;
              return (
                <section key={g}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{g}</h3>
                  <ol className="mt-4 relative border-l border-border/60 ml-3.5 space-y-6">
                    {items.map((a) => (
                      <li key={a.id} className="pl-6 relative">
                        <Avatar className="size-7 absolute -left-3.75 top-0 ring-2 ring-card">
                          <AvatarFallback className="bg-gradient-brand text-white text-[10px] font-bold">
                            {a.initials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm wrap-break-word">
                          <span className="font-medium">{a.actor}</span>{" "}
                          <span className="text-muted-foreground">{a.action}</span>
                          {a.object && <span className="font-medium"> {a.object}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.when}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
