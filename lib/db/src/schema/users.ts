import { pgTable, serial, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  internshipTitle: text("internship_title").notNull().default("Web Development Internship"),
  internshipField: text("internship_field").notNull().default("Web Development"),
  progress: real("progress").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  totalTasks: integer("total_tasks").notNull().default(14),
  certificateGenerated: boolean("certificate_generated").notNull().default(false),
  certificateId: text("certificate_id"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
