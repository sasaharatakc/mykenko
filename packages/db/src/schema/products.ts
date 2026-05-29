import { pgTable, uuid, text, varchar, boolean, timestamp, integer, numeric } from 'drizzle-orm/pg-core'

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  nameJa: varchar('name_ja', { length: 300 }).notNull(),
  brandName: varchar('brand_name', { length: 200 }),
  janCode: varchar('jan_code', { length: 13 }),
  descriptionJa: text('description_ja'),
  priceYen: integer('price_yen'),
  // 分類: OTC | quasi-drug | supplement | food
  productType: varchar('product_type', { length: 30 }),
  manufacturer: varchar('manufacturer', { length: 200 }),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
