import { useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { EnhancedOutput } from "@/components/enhanced-output";
import { SamplePrompts } from "@/components/sample-prompts";
import { HistoryDrawer } from "@/components/history-drawer";
import { SettingsDrawer } from "@/components/settings-drawer";
import { DeploymentGuide } from "@/components/deployment-guide";
import { useQuery } from "@tanstack/react-query";
import type { Prompt } from "@shared/schema";

export default function Home() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const { data: prompts = [] } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mb-4">
            Sendora Dev
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhance your AI development prompts with intelligent processing and multi-modal inputs
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <PromptInput onSelect={setSelectedPrompt} />
            <SamplePrompts onSelect={setSelectedPrompt} />
          </div>
          <div className="lg:h-[calc(100vh-12rem)] sticky top-8">
            <EnhancedOutput prompt={selectedPrompt} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 left-4 flex gap-2">
        <SettingsDrawer />
        <DeploymentGuide />
      </div>
      <HistoryDrawer prompts={prompts} onSelect={setSelectedPrompt} />
    </div>
  );
}