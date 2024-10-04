import { Hono } from "hono"
import { appRouter } from "./trpc/root"
import { serve } from "@hono/node-server"
import { logger } from "hono/logger"
import { trpcServer } from "@hono/trpc-server"
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.use("*", logger());
app.use(prettyJSON());

app.use(
  "/trpc/*",
    trpcServer({
     router: appRouter,
     })
)

serve(app)
