import { z } from 'zod'

/**
 * Validate types of environment vaiables
 * If it's invalid, it does not allow connection
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_HOST: z.string().ip(),
  SECRET_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
