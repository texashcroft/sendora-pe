import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Star } from "lucide-react";
import type { Prompt } from "@shared/schema";
import { format } from "date-fns";

interface HistoryDrawerProps {
  prompts: Prompt[];
  onSelect: (prompt: Prompt) => void;
}

export function HistoryDrawer({ prompts, onSelect }: HistoryDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4"
        >
          <History className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Prompt History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] mt-4">
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="p-4 rounded-lg bg-card hover:bg-accent cursor-pointer"
                onClick={() => onSelect(prompt)}
              >
                <div className="flex items-center justify-between mb-2">
                  <time className="text-xs text-muted-foreground">
                    {prompt.timestamp && format(new Date(prompt.timestamp), "MMM d, yyyy HH:mm")}
                  </time>
                  {prompt.favorite === "true" && (
                    <Star className="h-4 w-4 fill-yellow-500" />
                  )}
                </div>
                <p className="text-sm line-clamp-2">{prompt.input}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}