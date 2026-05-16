import { Suspense } from 'react'
import type { Metadata } from 'next'
import SearchContent from './SearchContent'

export const metadata: Metadata = {
  title: 'Search Results | MYKENKO',
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
