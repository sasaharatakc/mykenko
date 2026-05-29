import { db, symptoms } from '@mykenko/db'
import { eq, count } from 'drizzle-orm'
import type { Pagination, PaginatedResponse } from '@mykenko/schemas'
import type { Symptom } from '@mykenko/db'
import { buildPaginatedResponse } from '@mykenko/schemas'

export class SymptomsService {
  async list(pagination: Pagination): Promise<PaginatedResponse<Symptom>> {
    const offset = (pagination.page - 1) * pagination.limit

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(symptoms)
        .where(eq(symptoms.isPublished, true))
        .limit(pagination.limit)
        .offset(offset),
      db.select({ value: count() }).from(symptoms).where(eq(symptoms.isPublished, true)),
    ])

    const total = Number(totals[0]?.value ?? 0)
    return buildPaginatedResponse(rows, total, pagination)
  }

  async findBySlug(slug: string): Promise<Symptom | null> {
    const rows = await db
      .select()
      .from(symptoms)
      .where(eq(symptoms.slug, slug))
      .limit(1)

    return rows[0] ?? null
  }
}
