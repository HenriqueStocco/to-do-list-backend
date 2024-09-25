// Third-party modules
import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
// Local modules
import { todos } from '../db/schema'
import { db, asc, eq, sql, and } from '../db'
import { authMiddleware } from '../middlewares/auth'

export const toDo = new Hono()

/**
 * Uses middleware to get the JWT from the cookie
 */
toDo.use(authMiddleware)

/**
 * Create a task
 */
toDo.post(
  '/',
  zValidator(
    'json',
    z.object({
      description: z.string(),
    })
  ),
  async ctx => {
    try {
      const body = ctx.req.valid('json')
      const userId = ctx.get('jwtPayload').id

      if (!userId) {
        return ctx.json(
          { unauthorized: 'Invalid or not exists token', userId },
          401
        )
      }

      if (!body.description) {
        return ctx.text('Error to create a todo', 401)
      }

      await db.insert(todos).values({
        description: body.description,
        userId,
      })

      return ctx.json({ message: 'Todo created successfully' }, 201)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal server error', 500)
    }
  }
)

/**
 * Get all tasks
 */
toDo.get('/', async ctx => {
  try {
    const userId = ctx.get('jwtPayload').id

    if (!userId) {
      return ctx.json(
        { unauthorized: 'Invalid or not exists token', userId },
        401
      )
    }

    const getTodoList = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(asc(todos.id))

    if (getTodoList.length < 1) return ctx.text('Todo list no exists', 400)

    return ctx.json({ data: getTodoList }, 200)
  } catch (error) {
    console.error(error)
    return ctx.text('Internal server error', 500)
  }
})

/**
 * Get a task by id
 */
toDo.get('/:id', async ctx => {
  try {
    const userId = ctx.get('jwtPayload').id
    const id = Number(ctx.req.param('id'))

    if (!userId) {
      return ctx.json(
        { unauthorized: 'Invalid or not exists token', userId },
        401
      )
    }

    if (!id) return ctx.text('Id no exists', 404)

    const getTodoById = await db.query.todos.findFirst({
      where: and(eq(todos.id, id), eq(todos.userId, userId)),
    })

    if (!getTodoById) return ctx.text('Todo not exists with that id', 404)

    return ctx.json({ data: getTodoById }, 200)
  } catch (error) {
    console.error(error)
    return ctx.text('Internal server error', 500)
  }
})

/**
 * Update a task by id
 */
toDo.put(
  '/:id',
  zValidator('param', z.coerce.number().int()),
  zValidator(
    'cookie',
    z.object({
      userId: z.string(),
    })
  ),
  zValidator(
    'json',
    z.object({
      description: z.string(),
    })
  ),
  async ctx => {
    try {
      const userId = ctx.get('jwtPayload').id
      const id = Number(ctx.req.param('id'))
      const body = ctx.req.valid('json')

      if (!userId) {
        return ctx.json(
          { unauthorized: 'Invalid or not exists token', userId },
          401
        )
      }

      if (!id || !body.description)
        ctx.text('Id or description not entered', 404)

      const updateTodoById = await db
        .update(todos)
        .set({ description: body.description, createdAt: sql`NOW()` })
        .where(and(eq(todos.id, id), eq(todos.userId, userId)))
        .returning()

      if (!updateTodoById) return ctx.text('The task could not be updated', 400)

      return ctx.text('Task updated succesfully', 201)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal server error', 500)
    }
  }
)

/**
 * Delete a task by id
 */
toDo.delete('/:id', zValidator('param', z.coerce.number().int()), async ctx => {
  try {
    const userId = ctx.get('jwtPayload').id
    const id = ctx.req.valid('param')

    if (!userId) {
      return ctx.json(
        { unauthorized: 'Invalid or not exists token', userId },
        401
      )
    }

    if (!id) return ctx.text('Id not exists', 404)

    await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning()

    return ctx.text('Tasks deleted successfully')
  } catch (error) {
    console.error(error)
    return ctx.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * Delete all tasks from current user
 */
toDo.delete('/', async ctx => {
  try {
    const userId = ctx.get('jwtPayload').id

    if (!userId) {
      return ctx.json(
        { unauthorized: 'Invalid or not exists token', userId },
        401
      )
    }

    await db.delete(todos).where(eq(todos.userId, userId))

    return ctx.json({ message: 'All tasks deleted successfully' }, 200)
  } catch (error) {
    console.error(error)
    return ctx.json({ error: 'Internal server error' }, 500)
  }
})
