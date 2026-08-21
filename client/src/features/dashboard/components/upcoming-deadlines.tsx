import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IUpcomingDeadline } from "../types";

interface UpcomingDeadlinesProps {
  data?: IUpcomingDeadline[];
}

export function UpcomingDeadlines({ data = [] }: UpcomingDeadlinesProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>Next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
            <p className="text-sm">No upcoming task deadlines</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-accent/40 transition-colors">
                <div>
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.project} • {item.date}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.priority === "Urgent"
                      ? "bg-red-500/10 text-red-500 border-transparent font-normal shrink-0"
                      : item.priority === "High"
                      ? "bg-orange-500/10 text-orange-500 border-transparent font-normal shrink-0"
                      : "bg-blue-500/10 text-blue-500 border-transparent font-normal shrink-0"
                  }
                >
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

