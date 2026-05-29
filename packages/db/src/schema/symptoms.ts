import { pgTable, uuid, text, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const symptoms = pgTable('symptoms', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  nameJa: varchar('name_ja', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }),
  descriptionJa: text('description_ja'),
  bodySystems: jsonb('body_systems').$type<string[]>().default([]),
  icdCode: varchar('icd_code', { length: 20 }),
  severity: varchar('severity', { length: 20 }),  // mild | moderate | severe
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Symptom = typeof symptoms.$inferSelect
export type NewSymptom = typeof symptoms.$inferInsert
