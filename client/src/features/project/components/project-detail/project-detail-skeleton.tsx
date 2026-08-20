import { Skeleton } from "@/components/ui/skeleton";

export function ProjectOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat Cards Skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <div className="mt-3 space-y-1.5">
              <Skeleton className="h-7 w-14" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* 3 Columns Grid Skeleton */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 items-stretch">
        {/* Column 1: Project Info */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="space-y-3.5 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
            ))}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Column 2: Upcoming Deadlines */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/40 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Recent Activity */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="space-y-4 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="size-7 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectTasksSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-muted/40">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-14 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCalendarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 items-start xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 pt-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="min-h-16 sm:min-h-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectMembersSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-12" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectActivitySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-xl shrink-0" />
            <div className="space-y-2 min-w-0">
              <Skeleton className="h-8 w-64 sm:w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Tabs List Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Content Overview Skeleton */}
      <ProjectOverviewSkeleton />
    </div>
  );
}
