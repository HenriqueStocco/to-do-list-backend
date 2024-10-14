import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { Bindings } from './types'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/root'
import { createTRPCContext } from './trpc/trpc'
// import { env } from './lib/env'

const app = new Hono<{ Bindings: Bindings }>()

app.all('/trpc/*', async context => {
  const handler = async () => {
    const response = await fetchRequestHandler({
      endpoint: 'trpc/',
      req: context.req.raw,
      router: appRouter,
      createContext: () =>
        createTRPCContext({
          DATABASE_URL: context.env.DATABASE_URL,
        }),
      onError: undefined,
    })
    return response
  }
  return await handler()
})

const port = 3000

serve({
  fetch: app.fetch,
  hostname: '127.0.0.1',
  port,
}).on('listening', () => {
  console.log('HTTP Server running on 3000')
})
