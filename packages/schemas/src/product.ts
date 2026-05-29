import { z } from 'zod'

export const productTypeSchema = z.enum(['OTC', 'quasi-drug', 'supplement', 'food'])
export type ProductType = z.infer<typeof productTypeSchema>

export const productSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(200),
  nameJa: z.string().min(1).max(300),
  brandName: z.string().max(200).optional(),
  janCode: z.string().length(13).optional(),
  descriptionJa: z.string().optional(),
  priceYen: z.number().int().positive().optional(),
  productType: productTypeSchema.optional(),
  manufacturer: z.string().max(200).optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Product = z.infer<typeof productSchema>
