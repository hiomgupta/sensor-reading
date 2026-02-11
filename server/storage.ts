import { db } from "./db";
import {
  sensor_sessions,
  type InsertSession,
  type Session
} from "@shared/schema";

export interface IStorage {
  // Minimal storage interface
  createSession(session: InsertSession): Promise<Session>;
}

export class DatabaseStorage implements IStorage {
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sensor_sessions)
      .values(insertSession)
      .returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
