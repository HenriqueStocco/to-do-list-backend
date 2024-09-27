import { defineConfig, type Config } from 'drizzle-kit'
import { env } from './src/lib/env'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
}) satisfies Config
