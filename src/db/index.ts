// Third-party modules
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
// Local modules
import { env } from '../env'
import * as schema from './schema'

/**
 * Create postgres client
 */
export const client = postgres(env.DATABASE_URL)
/**
 * Use postgres client on drizzle
 */
export const db = drizzle(client, { schema, logger: true })

/**
 * Export route third-party dependencies
 */
export { asc, eq, sql, and } from 'drizzle-orm'
export { PostgresError } from 'postgres'
