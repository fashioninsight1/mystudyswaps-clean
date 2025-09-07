import { pgTable, uuid, text, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password'),
  role: text('role', { enum: ['student', 'parent', 'teacher'] }).notNull(),
  age: integer('age'),
  keyStage: text('key_stage'),
  subscriptionTier: text('subscription_tier').default('free'),
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
