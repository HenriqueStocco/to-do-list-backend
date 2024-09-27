// Third-party modules
import { jwt, sign } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import type { Context, Next } from 'hono'
// Local module
import { env } from '../lib/env'
import { z } from 'zod'

/**
 * Schema to validate payload
 */
const jwtPayloadSchema = z.object({
  id: z.string().min(1, 'User ID cannot be empty'),
})

/**
 * Validate payload with zod
 */
const validateJwtPayload = <T>(payload: T) => {
  return jwtPayloadSchema.safeParse(payload)
}

/**
 * Generate Jason Web Token by user id
 */
export const generateToken = async (userId: string) => {
  return await sign({ id: userId }, env.SECRET_KEY)
}

/**
 * Get token from cookie
 * Verify if token exists
 * Validate token
 */
export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = getCookie(ctx, 'token') // Get token called 'token'

  if (!token) {
    return ctx.json({ status: 'Unauthorized', message: 'Missing token' }, 401)
  }

  try {
    // Validate JWT
    const decoded = await jwt({
      secret: env.SECRET_KEY,
      cookie: 'token',
      alg: 'HS256',
    })(ctx, next)

    const validationResult = validateJwtPayload(decoded)

    if (!validationResult.success) {
      return ctx.json(
        { status: 'Unauthorized', message: 'Invalid token payload' },
        401
      )
    }
    ctx.set('jwtPayload', validationResult.data)

    await next()
  } catch (error) {
    return ctx.json({ status: 'Unauthorized', message: 'Invalid token' }, 401)
  }
}
