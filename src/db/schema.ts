// Third-party module
import {
  uuid,
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core'

/**
 * Schema `users` table
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull().unique(),
  email: varchar('email', { length: 120 }).notNull().unique(),
  password: varchar('hashed_password').notNull(),
})

/**
 * Schema `todos` table
 */
export const todos = pgTable('todos', {
  id: serial('id').primaryKey().notNull().unique(),
  description: varchar('description', { length: 200 }).notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  // User references
  userId: uuid('user_id').references(() => users.id),
})
