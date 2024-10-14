import { createInsertSchema } from 'drizzle-zod'
import { notes } from '../schema'

export const notesSchema = createInsertSchema(notes)
