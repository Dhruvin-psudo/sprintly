import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Search, ArrowUp, ArrowDown, X } from "lucide-react";
import { CreateProjectDialog } from "./create-project-dialog";
import { useState } from "react";
import { OrderBy, ProjectPhase, ProjectPriority, type IProjectQuery } from "../types";

interface ProjectHeaderProps {
    readonly searchInput: string;
    readonly onSearchChange: (value: string) => void;
    readonly query: IProjectQuery;
    readonly onQueryChange: (partial: Partial<IProjectQuery>) => void;
    readonly onClearFilters: () => void;
}

const PHASE_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Planning", value: ProjectPhase.PLANNING },
  { label: "Active", value: ProjectPhase.ACTIVE },
  { label: "On Hold", value: ProjectPhase.ON_HOLD },
  { label: "Completed", value: ProjectPhase.COMPLETED },
  { label: "Cancelled", value: ProjectPhase.CANCELLED },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "all" },
  { label: "Low", value: ProjectPriority.LOW },
  { label: "Medium", value: ProjectPriority.MEDIUM },
  { label: "High", value: ProjectPriority.HIGH },
  { label: "Urgent", value: ProjectPriority.URGENT },
];

const SORT_BY_OPTIONS = [
  { label: "Created Date", value: "createdAt" },
  { label: "Due Date", value: "dueDate" },
  { label: "Start Date", value: "startDate" },
  { label: "Status", value: "phase" },
  { label: "Priority", value: "priority" },
];

const getPhaseLabel = (phase?: string) => {
  if (!phase || phase === "all") return "All Statuses";
  const found = PHASE_OPTIONS.find((opt) => opt.value === phase);
  return found ? found.label : phase;
};

const getPriorityLabel = (priority?: string) => {
  if (!priority || priority === "all") return "All Priorities";
  const found = PRIORITY_OPTIONS.find((opt) => opt.value === priority);
  return found ? found.label : priority;
};

const getSortByLabel = (sortBy?: string) => {
  const found = SORT_BY_OPTIONS.find((opt) => opt.value === (sortBy || "createdAt"));
  return found ? found.label : "Created Date";
};

export function ProjectHeader({
    searchInput,
    onSearchChange,
    query,
    onQueryChange,
    onClearFilters
  }: ProjectHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOrderAsc = (query.sortOrder)?.toString().toLowerCase() === "asc";

  const hasActiveFilters = Boolean(
    query.phase ||
    query.priority ||
    (query.sortBy && query.sortBy !== "createdAt") ||
    isOrderAsc ||
    searchInput
  );

  const toggleSortOrder = () => {
    const nextOrder = isOrderAsc ? OrderBy.DESC : OrderBy.ASC;
    onQueryChange({ sortOrder: nextOrder, page: 1 });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">
              All projects across your workspace.
            </p>
          </div>

          <CreateProjectDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button className="bg-gradient-brand text-white hover:opacity-90 shadow-glow">
              <Plus className="size-4" /> New Project
            </Button>
          </CreateProjectDialog>
        </div>

        {/* Search and Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-full bg-card border border-input pl-9 h-9 text-sm"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Status (Phase) Filter */}
          <Select
            value={query.phase || "all"}
            onValueChange={(val) =>
              onQueryChange({
                phase: !val || val === "all" ? undefined : (val as ProjectPhase),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[140px] h-9 bg-card border border-input text-sm rounded-md shadow-sm">
              <SelectValue>{getPhaseLabel(query.phase)}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {PHASE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={query.priority || "all"}
            onValueChange={(val) =>
              onQueryChange({
                priority: !val || val === "all" ? undefined : (val as ProjectPriority),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[140px] h-9 bg-card border border-input text-sm rounded-md shadow-sm">
              <SelectValue>{getPriorityLabel(query.priority)}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Select */}
          <Select
            value={query.sortBy || "createdAt"}
            onValueChange={(val) =>
              onQueryChange({
                sortBy: val ?? undefined,
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[150px] h-9 bg-card border border-input text-sm rounded-md shadow-sm">
              <SelectValue>{getSortByLabel(query.sortBy)}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {SORT_BY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order Direction Toggle Button with Tooltip */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                type="button"
                variant="outline"
                onClick={toggleSortOrder}
                className="h-9 w-9 p-0 bg-card border border-input rounded-md shadow-sm shrink-0"
              >
                {isOrderAsc ? (
                  <ArrowUp className="size-4 text-primary" />
                ) : (
                  <ArrowDown className="size-4 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isOrderAsc ? "Ascending" : "Descending"}
            </TooltipContent>
          </Tooltip>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClearFilters}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-md"
            >
              <X className="size-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
