'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { SearchHit } from '@/lib/meilisearch'

interface SearchResults {
  symptoms: SearchHit[]
  ingredients: SearchHit[]
}

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data: SearchResults = await res.json()
        setResults(data)
        setOpen(true)
      }
    } catch {
      // silently fail — search is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 300)
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const totalHits =
    (results?.symptoms.length ?? 0) + (results?.ingredients.length ?? 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => results && setOpen(true)}
          placeholder="症状・成分を検索..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-label="症状・成分を検索"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            ⏳
          </span>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {totalHits === 0 ? (
            <p className="text-sm text-gray-500 px-4 py-3">「{query}」の検索結果はありません</p>
          ) : (
            <>
              {(results?.symptoms.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 px-4 pt-3 pb-1 uppercase tracking-wide">
                    症状
                  </p>
                  {results!.symptoms.map((hit) => (
                    <Link
                      key={hit.id}
                      href={`/symptoms/${hit.slug}/`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-primary-50 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-base">💊</span>
                      <span>{hit.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {(results?.ingredients.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 px-4 pt-3 pb-1 uppercase tracking-wide">
                    成分
                  </p>
                  {results!.ingredients.map((hit) => (
                    <Link
                      key={hit.id}
                      href={`/ingredients/${hit.slug}/`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-primary-50 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-base">🧪</span>
                      <span>{hit.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
