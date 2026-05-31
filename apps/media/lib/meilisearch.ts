const MEILI_HOST = process.env.MEILISEARCH_HOST ?? 'http://localhost:7700'
const MEILI_KEY = process.env.MEILISEARCH_API_KEY ?? ''

async function meiliRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<void> {
  try {
    const res = await fetch(`${MEILI_HOST}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILI_KEY}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[Meilisearch] ${method} ${path} → ${res.status}: ${text}`)
    }
  } catch (err) {
    console.error('[Meilisearch] fetch error:', err)
  }
}

export async function upsertSymptom(doc: {
  id: string
  slug: string
  nameJa: string
  nameEn?: string | null
  descriptionJa?: string | null
  isPublished: boolean
}): Promise<void> {
  if (!doc.isPublished) {
    await meiliRequest('DELETE', `/indexes/symptoms/documents/${doc.id}`)
    return
  }
  await meiliRequest('PUT', `/indexes/symptoms/documents`, [
    {
      id: doc.id,
      slug: doc.slug,
      nameJa: doc.nameJa,
      nameEn: doc.nameEn ?? '',
      descriptionJa: doc.descriptionJa ?? '',
    },
  ])
}

export async function upsertIngredient(doc: {
  id: string
  slug: string
  nameJa: string
  nameEn?: string | null
  descriptionJa?: string | null
  isPublished: boolean
}): Promise<void> {
  if (!doc.isPublished) {
    await meiliRequest('DELETE', `/indexes/ingredients/documents/${doc.id}`)
    return
  }
  await meiliRequest('PUT', `/indexes/ingredients/documents`, [
    {
      id: doc.id,
      slug: doc.slug,
      nameJa: doc.nameJa,
      nameEn: doc.nameEn ?? '',
      descriptionJa: doc.descriptionJa ?? '',
    },
  ])
}

export async function searchAll(query: string): Promise<{
  symptoms: SearchHit[]
  ingredients: SearchHit[]
}> {
  const [symptomsRes, ingredientsRes] = await Promise.all([
    fetch(`${MEILI_HOST}/indexes/symptoms/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILI_KEY}`,
      },
      body: JSON.stringify({ q: query, limit: 5 }),
    }).catch(() => null),
    fetch(`${MEILI_HOST}/indexes/ingredients/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILI_KEY}`,
      },
      body: JSON.stringify({ q: query, limit: 5 }),
    }).catch(() => null),
  ])

  const symptoms: SearchHit[] = symptomsRes?.ok
    ? ((await symptomsRes.json()).hits ?? []).map((h: Record<string, string>) => ({
        id: h.id,
        slug: h.slug,
        name: h.nameJa,
        type: 'symptom' as const,
      }))
    : []

  const ingredients: SearchHit[] = ingredientsRes?.ok
    ? ((await ingredientsRes.json()).hits ?? []).map((h: Record<string, string>) => ({
        id: h.id,
        slug: h.slug,
        name: h.nameJa,
        type: 'ingredient' as const,
      }))
    : []

  return { symptoms, ingredients }
}

export interface SearchHit {
  id: string
  slug: string
  name: string
  type: 'symptom' | 'ingredient'
}
