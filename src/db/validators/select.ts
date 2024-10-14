import { createSelectSchema } from 'drizzle-zod'
import { notes } from '../schema'

export const notesSchema = createSelectSchema(notes)
