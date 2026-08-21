import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ITeamActivity } from "../types";

interface TeamActivityProps {
  data?: ITeamActivity[];
}

export function TeamActivity({ data = [] }: TeamActivityProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Team activity</CardTitle>
        <CardDescription>Live from your workspace</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
            <p className="text-sm">No recent team activity</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-1.5 rounded-lg hover:bg-accent/40 transition-colors">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {item.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm leading-tight break-words">
                    <span className="font-medium text-foreground">{item.user.name}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>{" "}
                    <span className="font-medium text-foreground">{item.target}</span>
                    {item.destination && (
                      <>
                        <span className="text-muted-foreground"> to </span>
                        <span className="font-medium text-foreground">{item.destination}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

