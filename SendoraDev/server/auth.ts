import { compare, hash } from "bcryptjs";
import { storage } from "./storage";
import { type InsertUser, type LoginRequest } from "@shared/schema";
import { Express } from "express";
import session from "express-session";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  app.use(
    session({
      store: storage.sessionStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Authentication middleware
  app.use((req, res, next) => {
    req.user = req.session.user;
    next();
  });
}

declare module "express-session" {
  interface SessionData {
    user: { id: number; email: string; name: string | null };
  }
}
