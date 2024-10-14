import { initTRPC } from '@trpc/server'
import { pgDrizzle, PostgresClient } from '../db'

export const createTRPCContext = async (opts: { DATABASE_URL: string }) => {
  const dbClient = new PostgresClient({ connectionString: opts.DATABASE_URL })

  return {
    dbClient,
    database: pgDrizzle,
    env: opts.DATABASE_URL,
  }
}

export const t = initTRPC.context<typeof createTRPCContext>().create()
export const createTRPCRouter = t.router

const enforceConnection = t.middleware(async opts => {
  const { ctx } = opts
  await Promise.all([await ctx.dbClient.connect()])
  return opts.next()
})

export const publicProducedure = t.procedure.use(enforceConnection)
