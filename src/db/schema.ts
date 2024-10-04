import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name").notNull(),
  cpf: varchar("cpf").notNull(),
  email: varchar("email").notNull(),
  password: varchar("hashed_password").notNull(),
  username: varchar("username").notNull(),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
})

export const priorityType = pgEnum("priority_type", ["high", "medium", "low"])

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey().notNull().unique(),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  priority: priorityType("priority").default("low").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at", { mode: "string" }),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
})
