'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="text-gray-500 mt-2 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className="btn-primary mt-6">
          Try Again
        </button>
      </div>
    </div>
  )
}
