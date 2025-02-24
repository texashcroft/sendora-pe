import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Star } from "lucide-react";
import type { Prompt } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EnhancedOutputProps {
  prompt: Prompt | null;
}

export function EnhancedOutput({ prompt }: EnhancedOutputProps) {
  const { toast } = useToast();

  const toggleFavorite = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/prompts/${id}/favorite`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
    },
  });

  const copyToClipboard = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.enhanced);
    toast({
      title: "Copied!",
      description: "Enhanced prompt copied to clipboard",
    });
  };

  return (
    <Card className="bg-card h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <h2 className="text-2xl font-semibold">Enhanced Output</h2>
        <div className="flex gap-2">
          {prompt && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFavorite.mutate(prompt.id)}
                className="hover:bg-yellow-500/10"
              >
                <Star
                  className={`h-4 w-4 transition-colors ${
                    prompt.favorite === "true" ? "fill-yellow-500 text-yellow-500" : ""
                  }`}
                />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyToClipboard}
                className="hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {prompt ? (
          <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/50 p-6 rounded-b-lg h-[calc(100vh-16rem)] overflow-y-auto">
            {prompt.enhanced}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
            <div className="mb-4">
              <Star className="h-12 w-12 opacity-20" />
            </div>
            <p className="text-lg font-medium mb-2">No Prompt Selected</p>
            <p className="text-sm">
              Enter a prompt or select one from your history to see the enhanced version
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}