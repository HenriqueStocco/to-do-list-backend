// Third-party modules
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
// Local modules
import { env } from './env'
import { task } from './router/todo-routes'
import { user } from './router/user-routes'
import { prettyJSON } from 'hono/pretty-json'
import { compress } from 'hono/compress'

const app = new Hono().basePath('/api')

// Middlewares
app.use(prettyJSON())
app.use(logger())
app.use(compress())

// Routes
app.route('/task', task)
app.route('/auth', user)

// Local server listener
serve({
  fetch: app.fetch,
  port: 3000,
  hostname: env.NODE_HOST,
}).on('listening', () => console.log('HTTP Server running'))
