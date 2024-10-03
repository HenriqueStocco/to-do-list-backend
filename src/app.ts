import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { Hono } from "hono"
import { appRouter } from "./trpc/root"
import { createTRPCContext } from "./trpc"

const app = new Hono()

app.all("/trpc/*", async context => {
  const handler = async () => {
    const response = await fetchRequestHandler({
      endpoint: "trpc/",
      req: context.req.raw,
      router: appRouter,
      createContext: () =>
        createTRPCContext({
          request: context.req.raw,
          env: context.env,
          executionContext: context.executionCtx,
        }),
      onError: undefined,
    })
  }
})
