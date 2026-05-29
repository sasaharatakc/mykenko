import { Hono } from 'hono'
import { SymptomsService } from '../services/symptoms'

const app = new Hono()
const svc = new SymptomsService()

app.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const limit = Number(c.req.query('limit') ?? 20)
  const result = await svc.list({ page, limit })
  return c.json(result)
})

app.get('/:slug', async (c) => {
  const symptom = await svc.findBySlug(c.req.param('slug'))
  if (!symptom) return c.notFound()
  return c.json(symptom)
})

export const symptomsRouter = app
