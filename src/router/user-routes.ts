// Third-party modules
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
// Local modules
import { users } from '../db/schema'
import { db, eq, PostgresError } from '../db'
import { generateToken } from '../middlewares/auth'

/**
 * Zod schema type for registration and login
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

export const user = new Hono()

user.post('/register', async ctx => {
  const body = await ctx.req.json()
  const formValidation = loginSchema.safeParse(body)

  if (!formValidation.success) {
    return ctx.json(
      { status: 'Bad Request', issues: formValidation.error.errors },
      400
    )
  }

  const { email, password } = formValidation.data
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning()

    return ctx.json(
      { status: 'Created', message: 'The user was successfully created' },
      201
    )
  } catch (error) {
    if (error instanceof PostgresError) {
      if (error.code === '23505') {
        return ctx.json(
          { status: 'Conflict', message: 'User already exists' },
          409
        )
      }
    }
    return ctx.json(
      {
        status: 'Internl Server Error',
        message: 'An unexpected error occurred',
        error,
      },
      500
    )
  }
})

user.post('/login', async ctx => {
  const body = await ctx.req.json()
  const formValidation = loginSchema.safeParse(body)

  if (!formValidation.success) {
    return ctx.json(
      { status: 'Bad Request', message: 'Invalid or missing form input' },
      400
    )
  }

  const { email, password } = formValidation.data

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!userRecord || !(await bcrypt.compare(password, userRecord.password))) {
    return ctx.json(
      { status: 'Unauthorized', message: 'Invalid credentials' },
      401
    )
  }

  // Gera o token JWT
  const token = await generateToken(userRecord.id)

  // Armazena o token em um cookie seguro
  setCookie(ctx, 'token', token, {
    httpOnly: true,
    secure: false, // Mude para true se estiver em HTTPS
    sameSite: 'Strict',
    maxAge: 60 * 10, // Duração do cookie (10 Minutos)
    path: '/', // Define o caminho do cookie
  })

  console.log('Generated Token:', token) // Log do token gerado

  return ctx.json({ status: 'Success', message: 'Login successful' }, 200)
})
