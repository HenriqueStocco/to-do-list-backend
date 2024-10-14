import * as schema from './schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client as PostgresClient } from 'pg'

export const pgDrizzle = (client: PostgresClient) => {
  return drizzle(client, { schema, logger: true })
}

export { schema, PostgresClient }

export { and, eq, asc, sql } from 'drizzle-orm'
