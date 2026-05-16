'use client'

import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string          // current image URL (for preview)
  onChange: (file: File | null, url?: string) => void
  className?: string
  label?: string
}

export function ImageUpload({ value, onChange, className, label = '商品画像' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setPreview(url)
      onChange(file)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  function applyUrl() {
    if (!urlInput.trim()) return
    setPreview(urlInput.trim())
    onChange(null, urlInput.trim())
    setShowUrlInput(false)
    setUrlInput('')
  }

  function clear() {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {preview ? (
        <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden border border-gray-200 group">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 text-xs bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg shadow text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            変更
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full max-w-xs aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          )}
        >
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-gray-700">クリックまたはドロップ</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP — 最大 4MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {/* URL input toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowUrlInput(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <Link className="w-3 h-3" />
          URL から設定
        </button>
        {showUrlInput && (
          <div className="flex gap-2 mt-1.5">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-600"
            >
              適用
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
