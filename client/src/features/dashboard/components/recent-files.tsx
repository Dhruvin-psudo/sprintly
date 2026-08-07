import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface RecentFilesProps {
  data: {
    name: string;
    project: string;
    size: string;
    time: string;
  }[];
}

export function RecentFiles({ data }: RecentFilesProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent files</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {data.map((file, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{file.project} • {file.size}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{file.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
