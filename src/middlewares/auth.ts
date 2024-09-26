// Third-party modules
import { jwt, sign } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import type { Context, Next } from 'hono'
// Local module
import { env } from '../env'

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
    await jwt({ secret: env.SECRET_KEY, cookie: 'token', alg: 'HS256' })(
      ctx,
      next
    )
  } catch (error) {
    return ctx.json({ status: 'Unauthorized', message: 'Invalid token' }, 401)
  }
}
