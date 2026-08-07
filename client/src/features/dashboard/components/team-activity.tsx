import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamActivityProps {
  data: {
    user: { initials: string; name: string };
    action: string;
    target: string;
    destination: string;
    time: string;
  }[];
}

export function TeamActivity({ data }: TeamActivityProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Team activity</CardTitle>
        <CardDescription>Live from your workspace</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6">
          {data.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {item.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-tight">
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
      </CardContent>
    </Card>
  );
}
