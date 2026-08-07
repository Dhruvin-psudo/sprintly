import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UpcomingDeadlinesProps {
  data: { title: string; project: string; date: string; priority: string }[];
}

export function UpcomingDeadlines({ data }: UpcomingDeadlinesProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>Next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6">
          {data.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.project} • {item.date}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  item.priority === "Urgent"
                    ? "bg-red-500/10 text-red-500 border-transparent font-normal"
                    : item.priority === "High"
                    ? "bg-orange-500/10 text-orange-500 border-transparent font-normal"
                    : "bg-blue-500/10 text-blue-500 border-transparent font-normal"
                }
              >
                {item.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
