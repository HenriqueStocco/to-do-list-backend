import { drizzle } from "drizzle-orm/node-postgres"
import { Client as PostgresClient } from "pg"
import * as schema from "./schema"

export const pgDrizzle = (client: PostgresClient) => {
  return drizzle(client, { schema, logger: true })
}

export { schema, PostgresClient }
