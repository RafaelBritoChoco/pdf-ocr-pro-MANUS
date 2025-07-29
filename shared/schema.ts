import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalText: text("original_text"),
  processedText: text("processed_text"),
  summary: text("summary"),
  metadata: jsonb("metadata"),
  processingTime: integer("processing_time"), // in seconds
  wordCount: integer("word_count"),
  pageCount: integer("page_count"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const processingLogs = pgTable("processing_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id),
  step: text("step").notNull(),
  status: text("status").notNull(), // started, completed, failed
  message: text("message"),
  timestamp: timestamp("timestamp").defaultNow(),
  duration: integer("duration"), // in milliseconds
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProcessingLogSchema = createInsertSchema(processingLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ProcessingLog = typeof processingLogs.$inferSelect;
export type InsertProcessingLog = z.infer<typeof insertProcessingLogSchema>;

// Processing state types
export type ProcessingStep = 'upload' | 'extract' | 'analyze' | 'enhance' | 'complete';
export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ProcessingState {
  currentStep: number;
  status: ProcessingStatus;
  progress: number;
  message: string;
  timer: number; // seconds
  logs: Array<{
    timestamp: string;
    message: string;
    step: string;
    duration?: number;
  }>;
}

export interface DocumentSummary {
  documentType: string;
  totalPages: number;
  wordCount: number;
  processingTime: string;
  aiSummary: string;
}

export interface ProcessingSettings {
  extractionMethod: 'quick' | 'ai-correction' | 'ai-ocr';
  aiLevel: 'basic' | 'standard' | 'advanced';
  outputFormats: {
    text: boolean;
    word: boolean;
    markdown: boolean;
  };
  debugMode: boolean;
}
