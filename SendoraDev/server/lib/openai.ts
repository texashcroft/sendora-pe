import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const getOpenAIClient = async (userId: number) => {
  const apiKey = await storage.getApiKey(userId, "openai");
  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please add your API key in settings.");
  }

  return new OpenAI({ apiKey: apiKey.apiKey });
};

const AI_TOOL_PROMPTS = {
  replit: {
    create: "Format this prompt for Replit's AI web app creator. Focus on technical details, architecture, and clear instructions for creating a new application.",
    enhance: "Format this prompt for Replit's AI web app creator. Focus on improving clarity and technical specifications while maintaining the original intent.",
  },
  cursor: {
    create: "Format this prompt for Cursor's AI code generation. Emphasize specific implementation details and coding patterns for a new application.",
    enhance: "Format this prompt for Cursor's AI code generation. Focus on clarifying technical requirements and implementation details.",
  },
  v0: {
    create: "Format this prompt for v0.dev's UI generation. Include detailed design specifications, components, and layout structure for a new application.",
    enhance: "Format this prompt for v0.dev's UI generation. Focus on clarifying design requirements and component specifications.",
  },
};

export async function enhancePrompt(
  text: string,
  aiTool: "replit" | "cursor" | "v0",
  promptType: "create" | "enhance",
  userId: number,
  imageUrl?: string,
  voiceUrl?: string,
  context?: string,
): Promise<string> {
  const openai = await getOpenAIClient(userId);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: any }> = [
    {
      role: "system",
      content: `You are an expert at crafting prompts for AI development tools. ${AI_TOOL_PROMPTS[aiTool][promptType]}

Enhance the following ${promptType === "create" ? "request" : "prompt"} to be more specific, technical, and effective. Include:
1. Clear architecture/structure
2. Specific technical requirements
3. Design guidelines
4. Success criteria
5. Error handling considerations

${context ? `Additional Context:\n${context}\n\n` : ""}
Format the response in a clear, organized way with sections and bullet points.`,
    },
  ];

  if (imageUrl) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: "I'm also providing a screenshot for context. Please analyze it and incorporate relevant details into the enhanced prompt.",
        },
        {
          type: "image_url",
          image_url: imageUrl,
        },
        {
          type: "text",
          text: text,
        },
      ],
    });
  } else if (voiceUrl) {
    // First transcribe the voice input
    const transcription = await openai.audio.transcriptions.create({
      file: await fetch(voiceUrl).then(res => res.blob()),
      model: "whisper-1",
    });

    messages.push({
      role: "user",
      content: `Voice Input Transcription:\n${transcription.text}\n\nOriginal Text:\n${text}`,
    });
  } else {
    messages.push({
      role: "user",
      content: text,
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Failed to enhance prompt";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("OpenAI API error:", errorMessage);
    throw new Error("Failed to enhance prompt: " + errorMessage);
  }
}