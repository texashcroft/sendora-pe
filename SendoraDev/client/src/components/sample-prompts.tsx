import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@shared/schema";

const SAMPLE_PROMPTS = [
  "Create a todo app with React and Express",
  "Build a weather dashboard with real-time updates",
  "Make a markdown editor with preview",
];

interface SamplePromptsProps {
  onSelect: (prompt: Pick<Prompt, "input" | "enhanced">) => void;
}

export function SamplePrompts({ onSelect }: SamplePromptsProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <h2 className="text-lg font-semibold">Sample Prompts</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              className="text-sm"
              onClick={() => onSelect({ input: prompt, enhanced: "" })}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
