import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarWidget() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Deadlines this month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">August 2026</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
            {/* Mock calendar days */}
            <div className="text-muted-foreground/50 py-1.5">26</div>
            <div className="text-muted-foreground/50 py-1.5">27</div>
            <div className="text-muted-foreground/50 py-1.5">28</div>
            <div className="text-muted-foreground/50 py-1.5">29</div>
            <div className="text-muted-foreground/50 py-1.5">30</div>
            <div className="text-muted-foreground/50 py-1.5">31</div>
            <div className="py-1.5">1</div>
            
            <div className="py-1.5 bg-primary/20 text-primary font-medium rounded-md">2</div>
            <div className="py-1.5">3</div>
            <div className="py-1.5">4</div>
            <div className="py-1.5">5</div>
            <div className="py-1.5">6</div>
            <div className="py-1.5">7</div>
            <div className="py-1.5">8</div>

            <div className="py-1.5">9</div>
            <div className="py-1.5">10</div>
            <div className="py-1.5">11</div>
            <div className="py-1.5">12</div>
            <div className="py-1.5">13</div>
            <div className="py-1.5">14</div>
            <div className="py-1.5">15</div>

            <div className="py-1.5">16</div>
            <div className="py-1.5">17</div>
            <div className="py-1.5">18</div>
            <div className="py-1.5">19</div>
            <div className="py-1.5">20</div>
            <div className="py-1.5">21</div>
            <div className="py-1.5">22</div>

            <div className="py-1.5">23</div>
            <div className="py-1.5">24</div>
            <div className="py-1.5">25</div>
            <div className="py-1.5">26</div>
            <div className="py-1.5">27</div>
            <div className="py-1.5">28</div>
            <div className="py-1.5">29</div>

            <div className="py-1.5">30</div>
            <div className="py-1.5">31</div>
            <div className="text-muted-foreground/50 py-1.5">1</div>
            <div className="text-muted-foreground/50 py-1.5">2</div>
            <div className="text-muted-foreground/50 py-1.5">3</div>
            <div className="text-muted-foreground/50 py-1.5">4</div>
            <div className="text-muted-foreground/50 py-1.5">5</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
