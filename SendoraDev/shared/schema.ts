import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  provider: text("provider").notNull(),
  apiKey: text("api_key").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schema for API keys
export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  provider: true,
  apiKey: true,
  model: true,
});

// Create insert schema for users
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  hashedPassword: true,
  name: true,
});

// Prompts table
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  input: text("input").notNull(),
  enhanced: text("enhanced").notNull(),
  favorite: text("favorite").default("false"),
  timestamp: timestamp("timestamp").defaultNow(),
  promptType: text("promptType").notNull(), // Using the actual column name from DB
  imageUrl: text("imageUrl"), // Using the actual column name from DB
  voiceUrl: text("voice_url"), // Using the actual column name from DB
  context: text("context"),
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  userId: true,
  input: true,
  enhanced: true,
  favorite: true,
  promptType: true,
  imageUrl: true,
  voiceUrl: true,
  context: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export const enhancePromptSchema = z.object({
  input: z.string().min(1, "Please enter a prompt"),
  aiTool: z.enum(["replit", "cursor", "v0"]),
  promptType: z.enum(["create", "enhance"]),
  imageUrl: z.string().optional(),
  voiceUrl: z.string().optional(),
  context: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type EnhancePromptRequest = z.infer<typeof enhancePromptSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;