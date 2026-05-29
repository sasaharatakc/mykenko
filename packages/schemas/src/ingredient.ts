import { z } from 'zod'

export const evidenceLevelSchema = z.enum(['A', 'B', 'C'])
export type EvidenceLevel = z.infer<typeof evidenceLevelSchema>

export const ingredientSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(200),
  nameJa: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  casNumber: z.string().max(50).optional(),
  descriptionJa: z.string().optional(),
  evidenceLevel: evidenceLevelSchema.optional(),
  safetyNotes: z.string().optional(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Ingredient = z.infer<typeof ingredientSchema>

export const createIngredientSchema = ingredientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateIngredient = z.infer<typeof createIngredientSchema>
