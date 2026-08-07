import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActiveProjectsProps {
  data: {
    id: string;
    name: string;
    code: string;
    progress: number;
    dueDate: string;
    iconColor: string;
  }[];
}

export function ActiveProjects({ data }: ActiveProjectsProps) {
  return (
    <Card className="lg:col-span-2 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active projects</CardTitle>
        <Button variant="link" className="text-primary h-auto p-0 font-normal">View all</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((project) => (
             <div key={project.id} className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{project.code}</p>
                    <h4 className="font-semibold text-sm">{project.name}</h4>
                  </div>
                  <div className={`size-8 rounded-lg ${project.iconColor}`} />
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all" 
                      style={{ width: `${project.progress}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.progress}% • {Math.round(project.progress / 2)}/{Math.round(100 / 2)}</span>
                    <span>{project.dueDate}</span>
                  </div>
                </div>
             </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
