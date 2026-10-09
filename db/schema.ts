import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export type IssueRecord = {
  bookId: number;
  bookName: string;
  issueDate: string;
  dueDate: string;
  status: string;
  submitDate?: string;
};

export const admins = pgTable("admins", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  dob: text().notNull(),
  mobile: text().notNull(),
  regdNo: integer("regd_no").notNull().generatedAlwaysAsIdentity({ startWith: 1001 }),
  passwordHash: text("password_hash").notNull(),
  issue: jsonb().$type<IssueRecord[]>().notNull().default([]),
  submit: jsonb().$type<IssueRecord[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cover photos and page images are stored in Netlify Blobs, keyed by book id.
export const books = pgTable("books", {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  author: text().notNull(),
  quantity: integer().notNull().default(0),
  description: text().notNull(),
  pageCount: integer("page_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
