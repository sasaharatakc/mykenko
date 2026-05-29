import React from 'react'

interface DisclaimerProps {
  variant?: 'medical' | 'general'
  className?: string
}

export function Disclaimer({ variant = 'medical', className = '' }: DisclaimerProps) {
  if (variant === 'medical') {
    return (
      <div className={`rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 ${className}`}>
        <p className="font-semibold mb-1">⚠️ 免責事項</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>本ページの情報は一般的な情報提供を目的としており、医療上のアドバイスではありません。</li>
          <li>効果・効能を保証するものではありません。個人の症状や体質により異なります。</li>
          <li>症状がある場合は、必ず医師・薬剤師にご相談ください。</li>
          <li>購入・使用前に必ず専門家へご相談ください。</li>
        </ul>
      </div>
    )
  }

  return (
    <div className={`rounded-md bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 ${className}`}>
      <p>本ページの情報は一般的な情報提供を目的としています。効果を保証するものではありません。</p>
    </div>
  )
}
