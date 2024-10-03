import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { createTRPCRouter } from "."
import { taskRouter } from "./router/task"
import { userRouter } from "./router/user"

export const appRouter = createTRPCRouter({
  task: taskRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
