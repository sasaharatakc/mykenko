'use client'

import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

interface ProductSortBarProps {
  total: number
  sort: string
  viewMode: 'grid' | 'list'
  onSortChange: (value: string) => void
  onViewModeChange: (value: 'grid' | 'list') => void
  onFilterOpen: () => void
}

export function ProductSortBar({ total, sort, viewMode, onSortChange, onViewModeChange, onFilterOpen }: ProductSortBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white rounded-xl px-4 py-3 border border-gray-100">
      <div className="flex items-center gap-3">
        <button
          onClick={onFilterOpen}
          className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> products
        </span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50 text-gray-400')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn('p-1.5 transition-colors', viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50 text-gray-400')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
