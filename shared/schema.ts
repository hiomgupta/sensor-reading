import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We primarily use client-side storage as requested, 
// but this schema satisfies the project structure requirements.
export const sensor_sessions = pgTable("sensor_sessions", {
  id: serial("id").primaryKey(),
  deviceName: text("device_name").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  dataPoints: jsonb("data_points"), // Store readings if we ever wanted to save them
});

export const insertSessionSchema = createInsertSchema(sensor_sessions);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sensor_sessions.$inferSelect;

// Types for the frontend BLE logic
export interface SensorReading {
  timestamp: number;
  value: number;
  id: number;
}
