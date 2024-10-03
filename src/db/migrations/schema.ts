import { pgTable, uuid, varchar, timestamp, serial, boolean, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const priorityType = pgEnum("priority_type", ['high', 'medium', 'low'])



export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name").notNull(),
	cpf: varchar("cpf").notNull(),
	email: varchar("email").notNull(),
	hashedPassword: varchar("hashed_password").notNull(),
	username: varchar("username").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
	id: serial("id").primaryKey().notNull(),
	title: varchar("title", { length: 100 }).notNull(),
	description: varchar("description", { length: 255 }).notNull(),
	priority: priorityType("priority").default('low').notNull(),
	completion: boolean("completion").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
});