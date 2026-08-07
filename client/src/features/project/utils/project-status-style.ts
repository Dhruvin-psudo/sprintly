export interface ProjectStatusConfig {
  readonly label: string;
  readonly statusColor: string;
  readonly dotColor?: string;
}

export function getProjectStatusConfig(phase?: string): ProjectStatusConfig {
  const normalized = (phase || "").toUpperCase().trim();

  switch (normalized) {
    case "ACTIVE":
    case "IN_PROGRESS":
      return {
        label: "Active",
        statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dotColor: "bg-emerald-500",
      };
    case "PLANNING":
      return {
        label: "Planning",
        statusColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        dotColor: "bg-blue-500",
      };
    case "ON_HOLD":
      return {
        label: "On Hold",
        statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dotColor: "bg-amber-500",
      };
    case "PAUSED":
      return {
        label: "Paused",
        statusColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        dotColor: "bg-indigo-500",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        statusColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        dotColor: "bg-purple-500",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        dotColor: "bg-rose-500",
      };
    default: {
      const formattedLabel = phase
        ? phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase().replace(/_/g, " ")
        : "Planning";
      return {
        label: formattedLabel,
        statusColor: "bg-secondary text-secondary-foreground border-border/50",
        dotColor: "bg-slate-400",
      };
    }
  }
}
