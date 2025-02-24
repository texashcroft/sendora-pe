import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { enhancePromptSchema, loginSchema } from "@shared/schema";
import { enhancePrompt } from "./lib/openai";
import { ZodError } from "zod";
import { setupAuth, hashPassword, verifyPassword } from "./auth";
import * as z from 'zod';

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Setup authentication
  setupAuth(app);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = loginSchema.extend({ name: z.string().optional() }).parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ email, hashedPassword, name });

      req.session.user = { id: user.id, email: user.email, name: user.name };
      res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.hashedPassword))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.user = { id: user.id, email: user.email, name: user.name };
      res.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to log in" });
      }
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to log out" });
      } else {
        res.json({ message: "Logged out successfully" });
      }
    });
  });

  // Protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  app.post("/api/enhance", requireAuth, async (req, res) => {
    try {
      const { input, aiTool, promptType, imageUrl, voiceUrl, context } = enhancePromptSchema.parse(req.body);
      const enhanced = await enhancePrompt(input, aiTool, promptType, req.session.user.id, imageUrl, voiceUrl, context);
      const prompt = await storage.createPrompt({
        input,
        enhanced,
        favorite: "false",
        promptType,
        imageUrl,
        voiceUrl,
        context,
        userId: req.session.user.id,
      });
      res.json(prompt);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to enhance prompt" });
      }
    }
  });

  app.get("/api/prompts", requireAuth, async (req, res) => {
    const prompts = await storage.getPromptsByUser(req.session.user.id);
    res.json(prompts);
  });

  app.post("/api/prompts/:id/favorite", requireAuth, async (req, res) => {
    const { id } = req.params;
    const prompt = await storage.toggleFavorite(parseInt(id));
    res.json(prompt);
  });

  // API Key Management Routes
  app.post("/api/settings/:provider", requireAuth, async (req, res) => {
    const { provider } = req.params;
    const { key, model } = req.body;

    if (!key || !model) {
      return res.status(400).json({ message: "API key and model are required" });
    }

    try {
      const apiKey = await storage.setApiKey({
        userId: req.session.user.id,
        provider,
        apiKey: key,
        model,
      });
      res.json({ message: "API key updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update API key" });
    }
  });

  app.get("/api/settings/:provider", requireAuth, async (req, res) => {
    const { provider } = req.params;
    try {
      const apiKey = await storage.getApiKey(req.session.user.id, provider);
      res.json({ hasKey: !!apiKey, model: apiKey?.model });
    } catch (error) {
      res.status(500).json({ message: "Failed to get API key status" });
    }
  });

  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const apiKeys = await storage.getAllApiKeys(req.session.user.id);
      const keysByProvider = Object.fromEntries(
        apiKeys.map(key => [key.provider, { hasKey: true, model: key.model }])
      );
      res.json(keysByProvider);
    } catch (error) {
      res.status(500).json({ message: "Failed to get API keys" });
    }
  });

  // Model Selection Routes (Original code remains)
  app.post("/api/settings/:provider/model", async (req, res) => {
    const { provider } = req.params;
    const { model } = req.body;

    if (!model) {
      return res.status(400).json({ message: "Model selection is required" });
    }

    try {
      // Store the model preference in environment variables
      process.env[`${provider.toUpperCase()}_MODEL`] = model;
      res.json({ message: "Model updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  app.get("/api/settings/:provider/model", async (req, res) => {
    const { provider } = req.params;
    const model = process.env[`${provider.toUpperCase()}_MODEL`] || getDefaultModel(provider);
    res.json({ model });
  });

  return httpServer;
}

function getDefaultModel(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'gpt-4o';
    case 'deepseek':
      return 'deepseek-r1';
    case 'claude':
      return 'claude-3.5-sonnet';
    default:
      return '';
  }
}