import { pgTable, uuid, text, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core'

export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  nameJa: varchar('name_ja', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }),
  casNumber: varchar('cas_number', { length: 50 }),
  descriptionJa: text('description_ja'),
  // 証拠レベル: A (強い) | B (中程度) | C (弱い)
  evidenceLevel: varchar('evidence_level', { length: 1 }),
  safetyNotes: text('safety_notes'),
  isPublished: boolean('is_published').notNull().default(false),
  sortOrder: integer('sort_order').default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Ingredient = typeof ingredients.$inferSelect
export type NewIngredient = typeof ingredients.$inferInsert
