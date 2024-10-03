import { initTRPC } from "@trpc/server"
import { ZodError } from "zod"
import type { ExecutionContext } from "hono"
import { PostgresClient as Client, pgDrizzle as drizzle } from "../db"

export type Bindings = {
  DATABASE_URL: string
}

export const createTRPCContext = async (opts: {
  request: Request
  env: Bindings
  executionContext: ExecutionContext
}) => {
  const mainClient = new Client({
    connectionString: opts.env.DATABASE_URL,
  })

  return {
    request: opts.request,
    executionContext: opts.executionContext,
    database: drizzle,
    mainClient,
  }
}

export const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const procedure = t.procedure
