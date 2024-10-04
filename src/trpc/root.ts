import { createTRPCRouter } from "."
import { taskRouter } from "./router/task"


/**
 * Passing the routes to appRouter
 */
export const appRouter = createTRPCRouter({
  task: taskRouter,
  // user: userRouter,
})

export type AppRouter = typeof appRouter
