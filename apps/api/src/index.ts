import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { symptomsRouter } from './routers/symptoms'
import { ingredientsRouter } from './routers/ingredients'

const app = new Hono()

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: [
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      process.env.NEXT_PUBLIC_SHOP_URL ?? 'http://localhost:8000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.route('/api/symptoms', symptomsRouter)
app.route('/api/ingredients', ingredientsRouter)

const port = Number(process.env.API_PORT ?? 4000)
console.warn(`MYKENKO API listening on port ${port}`)

serve({ fetch: app.fetch, port })
