import { z } from 'zod'

export const symptomSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(200),
  nameJa: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  descriptionJa: z.string().optional(),
  bodySystems: z.array(z.string()).default([]),
  icdCode: z.string().max(20).optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Symptom = z.infer<typeof symptomSchema>

export const createSymptomSchema = symptomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateSymptom = z.infer<typeof createSymptomSchema>
