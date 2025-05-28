import { pgTable, text, serial, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(), // ISO date string
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull().default("My Business"),
  ownerName: text("owner_name").notNull().default("Business Owner"),
  email: text("email").notNull().default("owner@business.com"),
  currency: text("currency").notNull().default("USD"),
  voiceInputEnabled: boolean("voice_input_enabled").notNull().default(true),
  autoSavePhotos: boolean("auto_save_photos").notNull().default(false),
  darkModeEnabled: boolean("dark_mode_enabled").notNull().default(false),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  autoBackupEnabled: boolean("auto_backup_enabled").notNull().default(true),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
