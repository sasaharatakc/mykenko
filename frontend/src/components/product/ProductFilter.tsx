'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Star } from 'lucide-react'
import type { ProductCategory, Brand } from '@/types'
import { cn } from '@/lib/utils'

interface ProductFilterProps {
  categories: ProductCategory[]
  brands: Brand[]
  searchParams: Record<string, string | undefined>
  onUpdate: (key: string, value: string | null) => void
}

function FilterSection({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && children}
    </div>
  )
}

export function ProductFilter({ categories, brands, searchParams, onUpdate }: ProductFilterProps) {
  const [priceMin, setPriceMin] = useState(searchParams.min_price ?? '')
  const [priceMax, setPriceMax] = useState(searchParams.max_price ?? '')

  const selectedBrands = searchParams.brands?.split(',').map(Number) ?? []
  const selectedCategory = searchParams.category

  const toggleBrand = (id: number) => {
    const next = selectedBrands.includes(id)
      ? selectedBrands.filter((b) => b !== id)
      : [...selectedBrands, id]
    onUpdate('brands', next.length ? next.join(',') : null)
  }

  const applyPrice = () => {
    if (priceMin) onUpdate('min_price', priceMin)
    if (priceMax) onUpdate('max_price', priceMax)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
      <h2 className="font-display text-base font-semibold text-gray-900 mb-5">Filters</h2>

      {/* Categories */}
      <FilterSection title="Categories">
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => onUpdate('category', null)}
              className={cn('text-sm w-full text-left px-2 py-1 rounded-lg transition-colors',
                !selectedCategory ? 'text-primary-500 font-medium bg-primary-50' : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50')}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onUpdate('category', cat.slug)}
                className={cn('text-sm w-full text-left px-2 py-1 rounded-lg transition-colors',
                  selectedCategory === cat.slug ? 'text-primary-500 font-medium bg-primary-50' : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50')}
              >
                {cat.name}
              </button>
              {cat.children && cat.children.length > 0 && selectedCategory === cat.slug && (
                <ul className="ml-4 mt-1 space-y-1">
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => onUpdate('category', child.slug)}
                        className="text-xs text-gray-500 hover:text-primary-500 w-full text-left px-2 py-0.5 transition-colors"
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="input text-sm py-2 px-3"
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="input text-sm py-2 px-3"
            min={0}
          />
        </div>
        <button onClick={applyPrice} className="btn-primary w-full mt-3 text-sm py-2">
          Apply
        </button>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brands">
          <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {brands.map((brand) => (
              <li key={brand.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => toggleBrand(brand.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className={cn('text-sm transition-colors',
                    selectedBrands.includes(brand.id) ? 'text-primary-500 font-medium' : 'text-gray-600 group-hover:text-primary-500')}>
                    {brand.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Rating">
        <ul className="space-y-2">
          {[5, 4, 3, 2, 1].map((r) => (
            <li key={r}>
              <button
                onClick={() => onUpdate('rating', searchParams.rating === String(r) ? null : String(r))}
                className={cn('flex items-center gap-2 w-full px-2 py-1 rounded-lg transition-colors',
                  searchParams.rating === String(r) ? 'bg-primary-50' : 'hover:bg-gray-50')}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn('w-3.5 h-3.5', s <= r ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200')} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{r === 5 ? '5 stars' : `${r}+ stars`}</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* In Stock */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.in_stock === '1'}
            onChange={(e) => onUpdate('in_stock', e.target.checked ? '1' : null)}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  )
}
