import { z } from 'zod'
import { asc, eq, sql } from '../../db'
import { notes } from '../../db/schema'
import { createTRPCRouter, publicProducedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const noteRouter = createTRPCRouter({
  /**
   * Returns all notes
   */
  all: publicProducedure.query(async ({ ctx: { database, dbClient } }) => {
    const allNotes = await database(dbClient).query.notes.findMany({
      orderBy: asc(notes.id),
    })

    return allNotes
  }),

  /**
   * Returns note by id
   */
  byId: publicProducedure
    .input(z.object({ id: z.coerce.number() }))
    .query(async ({ ctx: { database, dbClient }, input }) => {
      const noteById = await database(dbClient).query.notes.findFirst({
        where: (notes, { eq }) => eq(notes.id, input.id),
      })

      return noteById
    }),

  /**
   * Creates a new note
   */
  create: publicProducedure
    .input(
      z.object({
        title: z.string().min(4, 'Too short').max(120, 'Too long'),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx: { database, dbClient }, input }) => {
      try {
        const [note] = await database(dbClient)
          .insert(notes)
          .values({
            title: input.title,
            description: input.description,
          })
          .returning()

        return note
      } catch (error) {
        console.error(error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
    }),

  /**
   * Updates title note
   */
  updateTitle: publicProducedure
    .input(
      z.object({
        id: z.coerce.number(),
        newTitle: z.string().min(4, 'Too short').max(120, 'Too long'),
      }),
    )
    .mutation(async ({ ctx: { database, dbClient }, input }) => {
      try {
        const [note] = await database(dbClient)
          .update(notes)
          .set({
            title: input.newTitle,
          })
          .where(eq(notes.id, input.id))
          .returning()

        return note
      } catch (error) {
        console.error(error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
    }),

  /**
   * Updates description note
   */
  updateDescription: publicProducedure
    .input(
      z.object({
        id: z.coerce.number(),
        newDescription: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx: { database, dbClient }, input }) => {
      try {
        const [note] = await database(dbClient)
          .update(notes)
          .set({
            description: input.newDescription,
            updatedAt: sql`NOW()`.mapWith(String),
          })
          .where(eq(notes.id, input.id))
          .returning()

        return note
      } catch (error) {
        console.error(error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
    }),

  /**
   * Deletes notes by id
   */
  delete: publicProducedure
    .input(z.object({ id: z.coerce.number() }))
    .mutation(async ({ ctx: { database, dbClient }, input }) => {
      try {
        const [note] = await database(dbClient)
          .delete(notes)
          .where(eq(notes.id, input.id))
          .returning()

        return note
      } catch (error) {
        console.error(error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
    }),
})
