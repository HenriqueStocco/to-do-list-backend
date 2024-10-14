import { pgTable, varchar, timestamp, text, serial } from 'drizzle-orm/pg-core'

export const notes = pgTable('notes', {
  id: serial('id').primaryKey().notNull(),
  title: varchar('title', { length: 120 }).default('note').notNull(),
  description: text('description').default(''),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
})
