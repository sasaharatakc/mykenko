import { Hono } from 'hono'
import { IngredientsService } from '../services/ingredients'

const app = new Hono()
const svc = new IngredientsService()

app.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const limit = Number(c.req.query('limit') ?? 20)
  const result = await svc.list({ page, limit })
  return c.json(result)
})

app.get('/:slug', async (c) => {
  const ingredient = await svc.findBySlug(c.req.param('slug'))
  if (!ingredient) return c.notFound()
  return c.json(ingredient)
})

export const ingredientsRouter = app
