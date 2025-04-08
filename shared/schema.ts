import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Projects Table
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  minimumInvestment: integer("minimum_investment").notNull(),
  estimatedReturns: doublePrecision("estimated_returns").notNull(),
  lockInPeriod: integer("lock_in_period").notNull(),
  availableSlots: integer("available_slots").notNull(),
  image: text("image").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

// Investment Models Table
export const investmentModels = pgTable("investment_models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  minInvestment: integer("min_investment").notNull(),
  roi: doublePrecision("roi").notNull(),
  lockInPeriod: integer("lock_in_period").notNull(),
  availableSlots: integer("available_slots").notNull(),
  projectId: text("project_id").notNull().references(() => projects.id),
});

export const insertInvestmentModelSchema = createInsertSchema(investmentModels).omit({
  id: true,
});

// Investments Table
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: text("project_id").notNull(),
  projectName: text("project_name").notNull(),
  modelId: text("model_id").notNull(),
  modelName: text("model_name").notNull(),
  slots: integer("slots").notNull(),
  amount: integer("amount").notNull(),
  expectedReturns: doublePrecision("expected_returns").notNull(),
  lockInPeriod: integer("lock_in_period").notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").notNull().default("active"),
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
});

// OTP Table
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpSchema = createInsertSchema(otps).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type InvestmentModel = typeof investmentModels.$inferSelect;
export type InsertInvestmentModel = z.infer<typeof insertInvestmentModelSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Otp = typeof otps.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
