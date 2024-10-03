import { z } from "zod"
import { createTRPCRouter, procedure } from ".."
import { tasks } from "../../db/schema"
import { TRPCError } from "@trpc/server"

export const createTaskSchema = z.object({
  title: z.string().min(4).max(100),
  description: z.string().min(4).max(100),
  priority: z.enum(["high", "medium", "low"]),
  completed: z.boolean(),
})

export const taskRouter = createTRPCRouter({
  all: procedure.query(async ({ ctx: { database, mainClient } }) => {
    const allTasks = await database(mainClient).select().from(tasks)

    return allTasks
  }),

  create: procedure
    .input(createTaskSchema)
    .mutation(async ({ ctx: { database, mainClient }, input }) => {
      try {
        const createdTask = await database(mainClient)
          .insert(tasks)
          .values({
            title: input.title,
            description: input.description,
            priority: input.priority,
            completed: input.completed,
          })
          .returning()

        if (!createdTask) throw new TRPCError({ code: "BAD_REQUEST" })

        return createdTask
      } catch (error) {
        console.error(error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
    }),
})
