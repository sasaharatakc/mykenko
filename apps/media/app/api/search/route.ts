import { NextRequest, NextResponse } from 'next/server'
import { searchAll } from '@/lib/meilisearch'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q.trim()) {
    return NextResponse.json({ symptoms: [], ingredients: [] })
  }
  const results = await searchAll(q.trim())
  return NextResponse.json(results)
}
