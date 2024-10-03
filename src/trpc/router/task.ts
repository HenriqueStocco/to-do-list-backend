import { string, z } from "zod"
import { createTRPCRouter, procedure } from ".."
import { tasks } from "../../db/schema"

// export const createTaskSchema = z.object({
//   title: z.string().min(4).max(100),
//   description: z.string().min(4).max(100),
//   priority: z.enum(["high", "medium", "low"]),
//   completion: z.boolean(),
// })

export const taskRouter = createTRPCRouter({
  all: procedure.query(async ({ ctx: { database, mainClient } }) => {
    const allTasks = await database(mainClient).select().from(tasks)

    return allTasks
  }),

  create: procedure
    .input(
      z.object({
        title: z.string().min(4).max(100),
        description: z.string().min(4).max(100),
        priority: z.enum(["high", "medium", "low"]),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx: { database, mainClient }, input }) => {
      try {
        const createTask = await database(mainClient)
          .insert(tasks)
          .values({
            title: input.title,
            description: input.description,
            priority: input.priority,
            completed: input.completed,
          })
          .returning()
      } catch (error) {}
    }),
})
