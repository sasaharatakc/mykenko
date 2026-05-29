import { db, ingredients } from '@mykenko/db'
import { eq, count } from 'drizzle-orm'
import type { Pagination, PaginatedResponse } from '@mykenko/schemas'
import type { Ingredient } from '@mykenko/db'
import { buildPaginatedResponse } from '@mykenko/schemas'

export class IngredientsService {
  async list(pagination: Pagination): Promise<PaginatedResponse<Ingredient>> {
    const offset = (pagination.page - 1) * pagination.limit

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(ingredients)
        .where(eq(ingredients.isPublished, true))
        .limit(pagination.limit)
        .offset(offset),
      db.select({ value: count() }).from(ingredients).where(eq(ingredients.isPublished, true)),
    ])

    const total = Number(totals[0]?.value ?? 0)
    return buildPaginatedResponse(rows, total, pagination)
  }

  async findBySlug(slug: string): Promise<Ingredient | null> {
    const rows = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.slug, slug))
      .limit(1)

    return rows[0] ?? null
  }
}
