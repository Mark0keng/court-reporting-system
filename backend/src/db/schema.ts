import {
  pgTable,
  serial,
  varchar,
  text,
  pgEnum,
  integer,
  decimal,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums Definition ---
export const roleEnum = pgEnum("role", ["admin", "reporter", "editor"]);

export const jobStatusEnum = pgEnum("job_status", [
  "NEW",
  "ASSIGNED",
  "TRANSCRIBED",
  "REVIEWED",
  "COMPLETED",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "reporter_fee",
  "editor_fee",
]);

// --- Tables Definition ---

// 1. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull().default("reporter"),
  baseRate: decimal("base_rate", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"), // Reporter: rate per minute, Editor: flat fee per job
  password: varchar("password", { length: 255 })
    .notNull()
    .default("password123"),
  location: varchar("location", { length: 255 }),
  availability: boolean("availability").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Jobs Table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: varchar("audio_url", { length: 500 }).notNull(),
  audioDurationSeconds: integer("audio_duration_seconds").notNull().default(0),
  status: jobStatusEnum("status").notNull().default("NEW"),
  location: varchar("location", { length: 255 }).notNull().default("remote"),
  reporterId: integer("reporter_id").references(() => users.id, {
    onDelete: "set null",
  }),
  editorId: integer("editor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reporterRatePerMinute: decimal("reporter_rate_per_minute", {
    precision: 10,
    scale: 2,
  }),
  editorFlatFee: decimal("editor_flat_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Transcripts Table
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  rawContent: text("raw_content"),
  editedContent: text("edited_content"),
  pageCount: integer("page_count").default(0),
  wordCount: integer("word_count").default(0),
  reporterSubmittedAt: timestamp("reporter_submitted_at"),
  editorSubmittedAt: timestamp("editor_submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  reporterJobs: many(jobs, { relationName: "reporterJobs" }),
  editorJobs: many(jobs, { relationName: "editorJobs" }),
  payments: many(payments),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  reporter: one(users, {
    fields: [jobs.reporterId],
    references: [users.id],
    relationName: "reporterJobs",
  }),
  editor: one(users, {
    fields: [jobs.editorId],
    references: [users.id],
    relationName: "editorJobs",
  }),
  transcript: one(transcripts, {
    fields: [jobs.id],
    references: [transcripts.jobId],
  }),
  payments: many(payments),
}));

export const transcriptsRelations = relations(transcripts, ({ one }) => ({
  job: one(jobs, {
    fields: [transcripts.jobId],
    references: [jobs.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  job: one(jobs, {
    fields: [payments.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
