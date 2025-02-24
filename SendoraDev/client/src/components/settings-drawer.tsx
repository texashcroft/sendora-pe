import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SettingsDrawer() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    deepseek: "",
    claude: "",
  });
  const [models, setModels] = useState({
    openai: "gpt-4o",
    deepseek: "deepseek-r1",
    claude: "claude-3.5-sonnet",
  });

  const handleSaveKey = async (provider: string, key: string) => {
    try {
      await fetch(`/api/settings/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      toast({
        title: "Success",
        description: `${provider.toUpperCase()} API key updated successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update API key",
      });
    }
  };

  const handleModelChange = async (provider: string, model: string) => {
    try {
      await fetch(`/api/settings/${provider}/model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });

      setModels(prev => ({ ...prev, [provider]: model }));
      toast({
        title: "Success",
        description: `${provider.toUpperCase()} model updated successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update model",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>API Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          {/* OpenAI Settings */}
          <div className="space-y-4">
            <Label>OpenAI Settings</Label>
            <div className="space-y-2">
              <Label htmlFor="openai">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="openai"
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  placeholder="sk-..."
                />
                <Button onClick={() => handleSaveKey("openai", apiKeys.openai)}>Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={models.openai}
                onValueChange={(value) => handleModelChange("openai", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OpenAI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                  <SelectItem value="o3-mini">O3-mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DeepSeek Settings */}
          <div className="space-y-4">
            <Label>DeepSeek Settings</Label>
            <div className="space-y-2">
              <Label htmlFor="deepseek">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="deepseek"
                  type="password"
                  value={apiKeys.deepseek}
                  onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                  placeholder="Enter API key..."
                />
                <Button onClick={() => handleSaveKey("deepseek", apiKeys.deepseek)}>Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={models.deepseek}
                onValueChange={(value) => handleModelChange("deepseek", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select DeepSeek model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek-r1">DeepSeek R1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Claude Settings */}
          <div className="space-y-4">
            <Label>Claude Settings</Label>
            <div className="space-y-2">
              <Label htmlFor="claude">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="claude"
                  type="password"
                  value={apiKeys.claude}
                  onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                  placeholder="Enter API key..."
                />
                <Button onClick={() => handleSaveKey("claude", apiKeys.claude)}>Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={models.claude}
                onValueChange={(value) => handleModelChange("claude", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Claude model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}