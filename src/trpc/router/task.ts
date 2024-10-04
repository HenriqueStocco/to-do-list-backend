import { z } from "zod"
import { createTRPCRouter, procedure } from ".."
import { tasks } from "../../db/schema"
import { TRPCError } from "@trpc/server"
import { db, eq, asc } from "../../db"

export const createTaskSchema = z.object({
  title: z.string().min(4).max(100),
  description: z.string().min(4).max(100),
  priority: z.enum(["high", "medium", "low"]),
  completed: z.boolean(),
})

export const taskRouter = createTRPCRouter({
  all: procedure.query(async () => {
    const allTasks = await db.select().from(tasks)

    return allTasks
  }),

  create: procedure.input(createTaskSchema).mutation(async ({ input }) => {
    try {
      const createdTask = await db
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

  getById: procedure.input(z.object({ id: z.string()})).query(async ({ input }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, Number(input.id)),
    })
    return task
  }),

  removeById: procedure.input(z.number()).query(async ({ input }) => {
    const response = await db.query.tasks.findFirst({
      where: eq(tasks.id, input)
    })
    return response 
  })

})
