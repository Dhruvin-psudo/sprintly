import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProductivityChartSkeleton() {
  return (
    <Card className="lg:col-span-2 flex flex-col border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function UpcomingDeadlinesSkeleton() {
  return (
    <Card className="flex flex-col border-border bg-card">
      <CardHeader className="space-y-1.5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-2 rounded-lg">
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ProjectCompletionSkeleton() {
  return (
    <Card className="flex flex-col border-border bg-card">
      <CardHeader className="space-y-1.5">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px]">
        <Skeleton className="h-[230px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function ActiveProjectsSkeleton() {
  return (
    <Card className="flex flex-col border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-4 w-14" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-border/60 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md shrink-0" />
      </div>

      <DashboardStatsSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductivityChartSkeleton />
        <UpcomingDeadlinesSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectCompletionSkeleton />
        <Card className="flex flex-col border-border bg-card">
          <CardHeader className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-1.5">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="space-y-1.5 w-full">
                  <Skeleton className="h-3.5 w-5/6" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <ActiveProjectsSkeleton />
      </div>
    </div>
  );
}


