import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  fundiId: integer("fundi_id").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  agreedPrice: real("agreed_price").notNull(),
  status: text("status", {
    enum: ["pending", "accepted", "rejected", "in_progress", "completed", "disputed"],
  }).notNull().default("pending"),
  scheduledDate: text("scheduled_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
  commissionAmount: real("commission_amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
