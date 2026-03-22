import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { internshipTemplatesTable } from "./internship_templates";

export interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const taskTemplatesTable = pgTable("task_templates", {
  id: serial("id").primaryKey(),
  internshipTemplateId: integer("internship_template_id").notNull().references(() => internshipTemplatesTable.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  videoUrl: text("video_url"),
  videoType: text("video_type"),
  questions: jsonb("questions").$type<MCQQuestion[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskTemplateSchema = createInsertSchema(taskTemplatesTable).omit({ id: true, createdAt: true });
export type InsertTaskTemplate = z.infer<typeof insertTaskTemplateSchema>;
export type TaskTemplate = typeof taskTemplatesTable.$inferSelect;
