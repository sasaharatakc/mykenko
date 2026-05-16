'use client'

import { useEffect, useState } from 'react'
import { countdown } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  endDate: string
  className?: string
  label?: string
}

export function CountdownTimer({ endDate, className, label = 'Ends in:' }: CountdownTimerProps) {
  const [time, setTime] = useState(countdown(endDate))

  useEffect(() => {
    const interval = setInterval(() => setTime(countdown(endDate)), 1000)
    return () => clearInterval(interval)
  }, [endDate])

  if (time.expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className="text-2xs text-gray-500">{label}</span>}
      <div className="flex items-center gap-1">
        {[
          { value: pad(time.hours), label: 'h' },
          { value: pad(time.minutes), label: 'm' },
          { value: pad(time.seconds), label: 's' },
        ].map(({ value, label: unit }, i) => (
          <div key={unit} className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-7 h-6 bg-gray-900 text-white rounded text-2xs font-mono font-semibold">
              {value}
            </span>
            <span className="text-2xs text-gray-500">{unit}</span>
            {i < 2 && <span className="text-gray-400 text-xs font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
