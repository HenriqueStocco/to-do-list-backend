import { TRPCError } from "@trpc/server"

import { createTRPCRouter, procedure } from ".."
import { users } from "../../db/schema"
import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string(),
  cpf: z.string().min(11).max(11),
  email: z.string().email(),
  password: z.string(),
  username: z.string().min(4),
})

export const userRouter = createTRPCRouter({
  create: procedure
    .input(createUserSchema)
    .mutation(async ({ ctx: { database, mainClient }, input }) => {
      try {
        const createdUser = await database(mainClient)
          .insert(users)
          .values({
            name: input.name,
            cpf: input.cpf,
            email: input.email,
            password: input.password,
            username: input.username,
          })
          .returning()

        if (!createdUser) throw new TRPCError({ code: "BAD_REQUEST" })

        return createdUser
      } catch (error) {
        console.error(error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
    }),
})
