import { notes } from '../schema'
import pg from 'pg'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { formatISO } from 'date-fns'
import { env } from '../../lib/env'
import { pgDrizzle } from '..'

/**
 * Generate fake data
 */
export async function createData() {
  const notesData: (typeof notes.$inferInsert)[] = []

  for (let i = 0; i < 20; i++) {
    notesData.push({
      title: faker.lorem.slug({ min: 5, max: 10 }),
      description: faker.lorem.paragraph({ min: 10, max: 20 }),
      createdAt: formatISO(new Date(), { representation: 'date' }),
      updatedAt: formatISO(new Date(), { representation: 'date' }),
    })
  }

  return { notesData }
}

/**
 * Insert into notes table the fake data
 */
async function main() {
  const client = new pg.Client({ connectionString: env.DATABASE_URL })
  await client.connect()

  const db = pgDrizzle(client)
  const { notesData } = await createData()

  await db.transaction(async tx => {
    await tx.insert(notes).values(notesData)
  })

  await client.end()
  process.exit(0)
}

main()
