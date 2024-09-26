// Third-party module
import { relations } from 'drizzle-orm'
import {
  uuid,
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core'

/**
 * Schema `users` table,
 * cardinality: 1:n
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull().unique(),
  email: varchar('email', { length: 120 }).notNull().unique(),
  password: varchar('hashed_password').notNull(),
})
/**
 * Relation: One USER to MANY TASKS
 */
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}))

/**
 * Schema `tasks` table
 */
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey().notNull().unique(),
  description: varchar('description', { length: 200 }).notNull(),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  // User references
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})
/**
 * Relation: MANY TASKS to ONE USER,
 * cardinality: n:1
 */
export const todosRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}))
