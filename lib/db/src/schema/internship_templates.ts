import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const internshipTemplatesTable = pgTable("internship_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  field: text("field").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInternshipTemplateSchema = createInsertSchema(internshipTemplatesTable).omit({ id: true, createdAt: true });
export type InsertInternshipTemplate = z.infer<typeof insertInternshipTemplateSchema>;
export type InternshipTemplate = typeof internshipTemplatesTable.$inferSelect;
