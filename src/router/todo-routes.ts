// Third-party modules
import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
// Local modules
import { tasks } from '../db/schema'
import { db, asc, eq, sql, and } from '../db'
import { authMiddleware } from '../middlewares/auth'

export const task = new Hono()

/**
 * Uses middleware to get the JWT from the cookie
 */
task.use(authMiddleware)

/**
 * Create a task
 */
task.post(
  '/',
  zValidator(
    'json',
    z.object({
      description: z
        .string()
        .min(4, 'Description cannot be empty')
        .max(200, 'Description is too long'),
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    })
  ),
  async ctx => {
    try {
      const userPayload = ctx.get('jwtPayload').id
      const body = ctx.req.valid('json')

      if (!userPayload) {
        return ctx.json(
          { status: 'Unauthorized', message: 'Invalid or missing token' },
          401
        )
      }

      if (!body.description) {
        return ctx.json(
          {
            status: 'Bad Request',
            message: 'Error trying to create a task',
          },
          400
        )
      }

      await db.insert(tasks).values({
        description: body.description,
        priority: body.priority,
        userId: userPayload,
      })

      return ctx.json(
        { status: 'Created', message: 'The task was successfully created' },
        201
      )
    } catch (error) {
      console.error(error)
      return ctx.json(
        {
          status: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        500
      )
    }
  }
)

/**
 * Get all tasks
 */
task.get('/all', async ctx => {
  const userPayload = ctx.get('jwtPayload').id

  /**
   * Pagination logic to fetch tasks for the user.
   * Calculates offset based on the current page and limit.
   */
  const { page = '1', limit = '10' } = ctx.req.query()
  const pageNumber = Number(page)
  const limitNumber = Number(limit)
  const offset = (pageNumber - 1) * limitNumber

  if (!userPayload) {
    return ctx.json(
      {
        status: 'Unauthorized',
        message: 'Invalid or missing token',
      },
      401
    )
  }

  try {
    const getTodoList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userPayload))
      .limit(limitNumber)
      .offset(offset)
      .orderBy(asc(tasks.id))

    if (getTodoList.length < 1) {
      return ctx.json(
        { status: 'Success', message: 'No tasks found for this user.' },
        200
      )
    }

    return ctx.json({ status: 'Success', tasks: getTodoList }, 200)
  } catch (error) {
    console.error(error)
    return ctx.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      },
      500
    )
  }
})

/**
 * Get a task by id
 */
task.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number().int().min(1, 'ID cannot be empty'),
    })
  ),
  async ctx => {
    try {
      const userPayload = ctx.get('jwtPayload').id
      const taskId = ctx.req.valid('param').id

      if (!userPayload) {
        return ctx.json(
          {
            status: 'Unauthorized',
            message: 'Invalid or missing token',
          },
          401
        )
      }

      if (!taskId) {
        return ctx.json(
          { status: 'Not Found', message: 'Missing task ID' },
          404
        )
      }

      const getTodoById = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, taskId), eq(tasks.userId, userPayload)),
      })

      if (!getTodoById) {
        return ctx.json(
          { status: 'Not Found', message: 'No task with this ID was found' },
          404
        )
      }

      return ctx.json({ status: 'Success', task: getTodoById }, 200)
    } catch (error) {
      console.error(error)
      return ctx.json(
        {
          status: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        500
      )
    }
  }
)

/**
 * Update a task by id
 */
task.put(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number().int().min(1, 'ID cannot be empty'),
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
      const userPayload = ctx.get('jwtPayload').id
      const taskId = ctx.req.valid('param').id
      const body = ctx.req.valid('json')

      if (!userPayload) {
        return ctx.json(
          { status: 'Unauthorized', message: 'Invalid or missing token' },
          401
        )
      }

      if (!taskId || !body.description)
        return ctx.json(
          {
            status: 'Not Found',
            message: 'Missing task ID or new description',
          },
          404
        )

      const updateTodoById = await db
        .update(tasks)
        .set({ description: body.description, createdAt: sql`NOW()` })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload)))
        .returning()

      if (!updateTodoById)
        return ctx.json(
          {
            status: 'Bad Request',
            message: 'The task could not be updated',
          },
          400
        )

      return ctx.json(
        { status: 'Success', message: 'The Task was succesfully updated' },
        200
      )
    } catch (error) {
      console.error(error)
      return ctx.json(
        {
          status: 'Internal Server Error',
          message: 'An unexpected error occurred',
          error,
        },
        500
      )
    }
  }
)

/**
 * Delete a task by id
 */
task.delete(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number().int().min(1, 'ID cannot be empty'),
    })
  ),
  async ctx => {
    try {
      const userPayload = ctx.get('jwtPayload').id
      const taskId = ctx.req.valid('param').id

      if (!userPayload) {
        return ctx.json(
          {
            status: 'Unauthorized',
            message: 'Invalid or missing token',
            userId: userPayload,
          },
          401
        )
      }

      if (!taskId)
        return ctx.json(
          { status: 'Not Found', message: 'Missing task ID' },
          404
        )

      await db
        .delete(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload)))
        .returning()

      return ctx.json(
        { status: 'Success', message: 'The Task was successfully deleted' },
        200
      )
    } catch (error) {
      console.error(error)
      return ctx.json(
        {
          status: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        500
      )
    }
  }
)

/**
 * Delete all tasks from current user
 */
task.delete('/', async ctx => {
  try {
    const userPayload = ctx.get('jwtPayload').id

    if (!userPayload) {
      return ctx.json(
        {
          status: 'Unauthorized',
          message: 'Invalid or missing token',
        },
        401
      )
    }

    await db.delete(tasks).where(eq(tasks.userId, userPayload))

    return ctx.json(
      { status: 'No Content', message: 'All tasks were successfully deleted' },
      204
    )
  } catch (error) {
    console.error(error)
    return ctx.json(
      {
        status: 'Internal Server Error',
        message: 'An unexpected error occurred',
      },
      500
    )
  }
})

/**
 * Complete a task
 */
task.patch(
  '/:id/completion',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number().int().min(1, 'ID cannot be empty'),
    })
  ),
  async ctx => {
    try {
      const userPayload = ctx.get('jwtPayload').id
      const taskId = ctx.req.valid('param').id

      if (!userPayload) {
        return ctx.json(
          { status: 'Unauthorized', message: 'Invalid or missing token' },
          401
        )
      }
      if (!taskId) {
        return ctx.json(
          { status: 'Not Found', message: 'Invalid or missing task ID' },
          404
        )
      }

      const updateResult = await db
        .update(tasks)
        .set({ completed: true, completedAt: sql`NOW()` })
        .where(and(eq(tasks.userId, userPayload), eq(tasks.id, taskId)))
        .returning()

      if (updateResult.length < 1) {
        return ctx.json(
          {
            status: 'Not Found',
            message: 'Task not found or unauthorized',
          },
          404
        )
      }

      return ctx.json(
        {
          status: 'Success',
          message: 'Task completed successfully',
          task: updateResult,
        },
        200
      )
    } catch (error) {
      console.error(error)
      return ctx.json(
        {
          status: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        500
      )
    }
  }
)

/**
 * Set a priority
 */

task.patch(
  '/:id/priority',
  zValidator(
    'json',
    z.object({
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    })
  ),
  zValidator(
    'param',
    z.object({
      id: z.coerce.number().int().min(1, 'ID cannot be empty'),
    })
  ),
  async ctx => {
    try {
      const userPayload = ctx.get('jwtPayload').id
      const taskId = ctx.req.valid('param').id
      const { priority } = ctx.req.valid('json')

      if (!userPayload) {
        return ctx.json(
          { status: 'Unauthorized', message: 'Invalid or missing token' },
          401
        )
      }
      if (!taskId) {
        return ctx.json(
          { status: 'Not Found', message: 'Invalid or missing task ID' },
          404
        )
      }

      const updatePriority = await db
        .update(tasks)
        .set({ priority })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload)))
        .returning()

      if (updatePriority.length < 1) {
        return ctx.json(
          { status: 'Not Found', message: 'Task not found or unauthorized' },
          404
        )
      }

      return ctx.json(
        { status: 'Success', message: 'Priority successfully updated' },
        200
      )
    } catch (error) {
      console.error(error)
      return ctx.json(
        {
          status: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        500
      )
    }
  }
)
