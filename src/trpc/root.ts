import { noteRouter } from './router/notes'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  note: noteRouter,
})

export type AppRouter = typeof appRouter
