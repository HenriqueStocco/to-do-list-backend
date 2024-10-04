import { initTRPC } from "@trpc/server"
import { ZodError } from "zod"

/**
 * Start tRPC instance passing the context and making the error handling
 */
export const t = initTRPC.create()

export const createTRPCRouter = t.router
export const procedure = t.procedure
