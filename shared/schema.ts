import { pgTable, uuid, text, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role', { enum: ['student', 'parent', 'teacher'] }).notNull(),
  age: integer('age'),
  keyStage: text('key_stage'),
  subscriptionTier: text('subscription_tier').default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  parentId: uuid('parent_id').references(() => users.id),
  studentUsername: text('student_username'),
  studentPassword: text('student_password'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  questions: jsonb('questions').notNull(),
  userAnswers: jsonb('user_answers'),
  score: decimal('score'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

export const fileUploads = pgTable('file_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  subject: text('subject').notNull(),
  topic: text('topic'),
  extractedText: text('extracted_text'),
  createdAt: timestamp('created_at').defaultNow()
});

export const revisionGuides = pgTable('revision_guides', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  totalPoints: integer('total_points').default(0),
  assessmentsCompleted: integer('assessments_completed').default(0),
  averageScore: decimal('average_score').default('0'),
  currentStreak: integer('current_streak').default(0),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const insertUserSchema = createInsertSchema(users);
export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertFileUploadSchema = createInsertSchema(fileUploads);
