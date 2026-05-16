'use client'

import { useState, useRef } from 'react'
import { Upload, Search, Grid, List, Image as ImageIcon, Film, FileText, Trash2, Info } from 'lucide-react'
import toast from 'react-hot-toast'

type FilterType = 'all' | 'image' | 'video' | 'document'
type ViewMode = 'grid' | 'list'

interface MediaFile {
  id: number
  name: string
  type: 'image' | 'video' | 'document'
  size: string
  date: string
  url: string
}

const MOCK_FILES: MediaFile[] = []

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>(MOCK_FILES)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || f.type === filter
    return matchSearch && matchFilter
  })

  function handleFiles(fileList: FileList) {
    const newFiles: MediaFile[] = Array.from(fileList).map((file, i) => ({
      id: Date.now() + i,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
      size: `${(file.size / 1024).toFixed(0)} KB`,
      date: new Date().toLocaleDateString('ja-JP'),
      url: URL.createObjectURL(file),
    }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`${newFiles.length}件のファイルをアップロードしました`)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  function handleBulkDelete() {
    if (!confirm(`${selected.size}件のファイルを削除しますか？`)) return
    setFiles((prev) => prev.filter((f) => !selected.has(f.id)))
    setSelected(new Set())
    toast.success('削除しました')
  }

  const TypeIcon = ({ type }: { type: MediaFile['type'] }) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4" />
    if (type === 'video') return <Film className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メディアライブラリ</h1>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
              {selected.size}件削除
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
          >
            <Upload className="w-4 h-4" />
            アップロード
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ファイルを検索..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          {(['all', 'image', 'video', 'document'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === t ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'all' ? 'すべて' : t === 'image' ? '画像' : t === 'video' ? '動画' : 'ドキュメント'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drop zone / content */}
      {filtered.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white rounded-xl shadow-sm border-2 border-dashed cursor-pointer transition-colors p-16 text-center ${
            dragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-1">ファイルをドラッグ＆ドロップ またはクリックして選択</p>
          <p className="text-sm text-gray-400">対応形式: JPG, PNG, GIF, WebP, MP4, PDF, DOC</p>
          <p className="text-xs text-gray-400 mt-1">最大ファイルサイズ: 10MB</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-xl border cursor-pointer transition-all ${
                selected.has(file.id) ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSelect(file.id)}
            >
              <div className="aspect-square bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <TypeIcon type={file.type} />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{file.size} · {file.date}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-8 px-4 py-3"><input type="checkbox" onChange={(e) => e.target.checked ? setSelected(new Set(filtered.map(f=>f.id))) : setSelected(new Set())} /></th>
                {['ファイル名', 'タイプ', 'サイズ', '日付', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{file.name}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{file.type}</td>
                  <td className="px-4 py-3 text-gray-500">{file.size}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{file.date}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelected(new Set([file.id])); handleBulkDelete() }}
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>ファイルは NEXT_PUBLIC_STORAGE_URL/storage/{'{path}'} で配信されます</span>
      </div>
    </div>
  )
}
