import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enhancePromptSchema } from "@shared/schema";
import type { Prompt, EnhancePromptRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Mic } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PromptInputProps {
  onSelect: (prompt: Prompt) => void;
}

export function PromptInput({ onSelect }: PromptInputProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const form = useForm<EnhancePromptRequest>({
    resolver: zodResolver(enhancePromptSchema),
    defaultValues: {
      input: "",
      aiTool: "replit",
      promptType: "create",
      context: "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const enhance = useMutation({
    mutationFn: async (data: EnhancePromptRequest) => {
      const formData = new FormData();
      formData.append("input", data.input);
      formData.append("aiTool", data.aiTool);
      formData.append("promptType", data.promptType);
      if (data.context) {
        formData.append("context", data.context);
      }
      if (imagePreview) {
        formData.append("imageUrl", imagePreview);
      }
      if (audioUrl) {
        formData.append("voiceUrl", audioUrl);
      }

      const res = await apiRequest("POST", "/api/enhance", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      onSelect(data);
      toast({
        title: "Prompt enhanced!",
        description: "Your prompt has been enhanced and saved.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Card className="bg-card">
      <CardHeader>
        <h2 className="text-xl font-semibold">Input Prompt</h2>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => enhance.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="promptType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to do?</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="create" id="create" />
                      <FormLabel htmlFor="create">Create New App</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="enhance" id="enhance" />
                      <FormLabel htmlFor="enhance">Enhance Existing Prompt</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiTool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Tool</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI tool" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="replit">Replit</SelectItem>
                      <SelectItem value="cursor">Cursor</SelectItem>
                      <SelectItem value="v0">v0.dev</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        form.watch("promptType") === "create"
                          ? "Describe the app you want to create..."
                          : "Paste the prompt you want to enhance..."
                      }
                      className="h-32"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Context (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant context or background information..."
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Upload Screenshot (Optional)</FormLabel>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Voice Input (Optional)</FormLabel>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                  {audioUrl && (
                    <audio src={audioUrl} controls className="w-48" />
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={enhance.isPending}>
              {enhance.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                `${form.watch("promptType") === "create" ? "Create" : "Enhance"} Prompt`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}