import { prompts, users, apiKeys, type Prompt, type InsertPrompt, type User, type InsertUser, type ApiKey, type InsertApiKey } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompts(): Promise<Prompt[]>;
  getPromptsByUser(userId: number): Promise<Prompt[]>;
  toggleFavorite(id: number): Promise<Prompt>;
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getApiKey(userId: number, provider: string): Promise<ApiKey | undefined>;
  setApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getAllApiKeys(userId: number): Promise<ApiKey[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db
      .insert(prompts)
      .values(insertPrompt)
      .returning();
    return prompt;
  }

  async getPrompts(): Promise<Prompt[]> {
    return db
      .select()
      .from(prompts)
      .orderBy(prompts.timestamp);
  }

  async getPromptsByUser(userId: number): Promise<Prompt[]> {
    return db
      .select()
      .from(prompts)
      .where(eq(prompts.userId, userId))
      .orderBy(prompts.timestamp);
  }

  async toggleFavorite(id: number): Promise<Prompt> {
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, id));

    if (!prompt) throw new Error("Prompt not found");

    const [updated] = await db
      .update(prompts)
      .set({ favorite: prompt.favorite === "true" ? "false" : "true" })
      .where(eq(prompts.id, id))
      .returning();

    return updated;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getApiKey(userId: number, provider: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.userId, userId),
          eq(apiKeys.provider, provider)
        )
      );
    return apiKey;
  }

  async setApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    // Delete existing key if it exists
    await db
      .delete(apiKeys)
      .where(
        and(
          eq(apiKeys.userId, insertApiKey.userId),
          eq(apiKeys.provider, insertApiKey.provider)
        )
      );

    // Insert new key
    const [apiKey] = await db
      .insert(apiKeys)
      .values(insertApiKey)
      .returning();
    return apiKey;
  }

  async getAllApiKeys(userId: number): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
  }
}

export const storage = new DatabaseStorage();