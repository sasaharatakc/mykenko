import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'

// Polymorphic SEO pages table — tracks canonical URL, SEO metadata
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: varchar('url', { length: 500 }).notNull().unique(),
  entityType: varchar('entity_type', { length: 50 }),  // symptom | ingredient | product | lp
  entityId: uuid('entity_id'),
  titleJa: varchar('title_ja', { length: 120 }),
  descriptionJa: varchar('description_ja', { length: 160 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  ogImageUrl: varchar('og_image_url', { length: 500 }),
  isIndexable: boolean('is_indexable').notNull().default(true),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  lastModifiedAt: timestamp('last_modified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
