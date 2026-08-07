import { Skeleton } from "@/components/ui/skeleton";

interface ProjectListSkeletonProps {
  readonly hideHeader?: boolean;
}

export function ProjectListSkeleton({ hideHeader = false }: ProjectListSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header & Filter Toolbar Skeleton Section */}
      {!hideHeader && (
        <div className="space-y-6 mb-8">
          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-36 rounded-xl shrink-0" />
          </div>

          {/* Toolbar Row Skeleton */}
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 flex-1 min-w-[200px] max-w-sm rounded-md" />
            <Skeleton className="h-9 w-[140px] rounded-md" />
            <Skeleton className="h-9 w-[140px] rounded-md" />
            <Skeleton className="h-9 w-[150px] rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md shrink-0" />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 block">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="size-10 rounded-xl shrink-0" />
            </div>
            
            <div className="mt-3 space-y-2 h-10">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>

            <div className="flex items-center justify-between mt-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
