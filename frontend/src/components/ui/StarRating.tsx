import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  count?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function StarRating({ rating, count, className, size = 'md', showCount = true }: StarRatingProps) {
  const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const textMap = { sm: 'text-2xs', md: 'text-xs', lg: 'text-sm' }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeMap[size],
              star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'
            )}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className={cn(textMap[size], 'text-gray-500')}>({count})</span>
      )}
    </div>
  )
}
