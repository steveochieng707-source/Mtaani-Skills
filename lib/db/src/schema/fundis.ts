import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fundisTable = pgTable("fundis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skills: text("skills").array().notNull().default([]),
  tvtLevel: text("tvt_level", { enum: ["level_4", "level_5", "level_6"] }).notNull().default("level_5"),
  certificateUrl: text("certificate_url"),
  idNumber: text("id_number"),
  bio: text("bio"),
  hourlyRate: real("hourly_rate").notNull().default(500),
  location: text("location").notNull(),
  verified: boolean("verified").notNull().default(false),
  available: boolean("available").notNull().default(true),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFundiSchema = createInsertSchema(fundisTable).omit({ id: true, createdAt: true });
export type InsertFundi = z.infer<typeof insertFundiSchema>;
export type Fundi = typeof fundisTable.$inferSelect;
