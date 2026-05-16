'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Zap, Eye, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const saleSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  start_date:  z.string().min(1, 'Start date required'),
  end_date:    z.string().min(1, 'End date required'),
  status:      z.enum(['published', 'draft']).default('draft'),
  is_featured: z.boolean().optional(),
})
type SaleFormData = z.infer<typeof saleSchema>

const productSchema = z.object({
  product_id: z.number().min(1, 'Product required'),
  price:      z.number().min(0, 'Price required'),
  quantity:   z.number().int().min(1).optional(),
})
type ProductFormData = z.infer<typeof productSchema>

function StatusBadge({ sale }: { sale: any }) {
  const now = new Date()
  const start = new Date(sale.start_date)
  const end = new Date(sale.end_date)

  if (sale.status === 'draft') return <span className="badge bg-gray-100 text-gray-500">Draft</span>
  if (now < start) return <span className="badge bg-blue-100 text-blue-600">Scheduled</span>
  if (now > end) return <span className="badge bg-red-100 text-red-500">Ended</span>
  return <span className="badge bg-green-100 text-green-600 flex items-center gap-1"><Zap className="w-3 h-3" />Live</span>
}

export default function AdminFlashSalesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showProductModal, setShowProductModal] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'flash-sales'],
    queryFn: () => adminApi.flashSales({ per_page: 20 }).then(r => r.data),
  })

  const { data: expandedData } = useQuery({
    queryKey: ['admin', 'flash-sale', expandedId],
    queryFn: () => adminApi.showFlashSale(expandedId!).then(r => r.data),
    enabled: !!expandedId,
  })

  // All products for add-product modal
  const { data: allProductsData } = useQuery({
    queryKey: ['admin', 'products-select'],
    queryFn: () => adminApi.products({ per_page: 200, status: 'published' }).then(r => r.data),
    enabled: !!showProductModal,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: { status: 'draft', is_featured: false },
  })

  const { register: regProd, handleSubmit: handleProd, reset: resetProd, formState: { errors: prodErrors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { quantity: 50 },
  })

  const createMutation = useMutation({
    mutationFn: (d: SaleFormData) => adminApi.createFlashSale(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'flash-sales'] }); close(); toast.success('Flash sale created') },
    onError: () => toast.error('Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SaleFormData }) => adminApi.updateFlashSale(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'flash-sales'] }); close(); toast.success('Updated') },
    onError: () => toast.error('Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteFlashSale(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'flash-sales'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const addProductMutation = useMutation({
    mutationFn: ({ saleId, data }: { saleId: number; data: ProductFormData }) =>
      adminApi.addFlashSaleProduct(saleId, data),
    onSuccess: (_, { saleId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'flash-sale', saleId] })
      qc.invalidateQueries({ queryKey: ['admin', 'flash-sales'] })
      setShowProductModal(null)
      resetProd()
      toast.success('Product added')
    },
    onError: () => toast.error('Failed to add product'),
  })

  const removeProductMutation = useMutation({
    mutationFn: ({ saleId, productId }: { saleId: number; productId: number }) =>
      adminApi.removeFlashSaleProduct(saleId, { product_id: productId }),
    onSuccess: (_, { saleId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'flash-sale', saleId] })
      qc.invalidateQueries({ queryKey: ['admin', 'flash-sales'] })
      toast.success('Product removed')
    },
  })

  const sales = data?.data ?? []

  function open(s?: any) {
    if (s) {
      setEditing(s.id)
      reset({
        name: s.name,
        start_date: s.start_date?.slice(0, 16) ?? '',
        end_date: s.end_date?.slice(0, 16) ?? '',
        status: s.status,
        is_featured: s.is_featured,
      })
    } else {
      setEditing(null)
      reset({ name: '', start_date: '', end_date: '', status: 'draft', is_featured: false })
    }
    setShowModal(true)
  }

  function close() { setShowModal(false); setEditing(null) }

  function onSubmit(d: SaleFormData) {
    if (editing) updateMutation.mutate({ id: editing, data: d })
    else createMutation.mutate(d)
  }

  function onAddProduct(d: ProductFormData) {
    if (!showProductModal) return
    addProductMutation.mutate({ saleId: showProductModal, data: d })
  }

  function toggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id)
  }

  const allProducts: any[] = allProductsData?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Flash Sales
        </h1>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          <Plus className="w-4 h-4" /> New Flash Sale
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {sales.map((s: any) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Sale header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                    {s.is_featured && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded">Featured</span>}
                    <StatusBadge sale={s} />
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-3">
                    <span>Start: {formatDate(s.start_date, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    <span>End: {formatDate(s.end_date, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{s.products_count ?? 0} products</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setShowProductModal(s.id)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                    + Add Product
                  </button>
                  <button onClick={() => open(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this flash sale?')) deleteMutation.mutate(s.id) }}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleExpand(s.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                    {expandedId === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded products */}
              {expandedId === s.id && (
                <div className="border-t border-gray-100">
                  {!expandedData?.data?.products?.length ? (
                    <p className="px-5 py-4 text-sm text-gray-400">No products in this flash sale yet.</p>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-5 py-2 text-left">Product</th>
                          <th className="px-5 py-2 text-right">Original Price</th>
                          <th className="px-5 py-2 text-right">Sale Price</th>
                          <th className="px-5 py-2 text-right">Qty</th>
                          <th className="px-5 py-2 text-right">Sold</th>
                          <th className="px-5 py-2 text-right">Discount</th>
                          <th className="px-5 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {expandedData.data.products.map((p: any) => {
                          const discount = p.price > 0
                            ? Math.round((1 - p.pivot.price / p.price) * 100)
                            : 0
                          return (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-5 py-2.5">
                                <div className="flex items-center gap-2">
                                  {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />}
                                  <span className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-2.5 text-right text-sm text-gray-500">${p.price.toFixed(2)}</td>
                              <td className="px-5 py-2.5 text-right text-sm font-semibold text-primary">${p.pivot.price.toFixed(2)}</td>
                              <td className="px-5 py-2.5 text-right text-sm text-gray-600">{p.pivot.quantity}</td>
                              <td className="px-5 py-2.5 text-right text-sm text-gray-600">{p.pivot.sold}</td>
                              <td className="px-5 py-2.5 text-right">
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">-{discount}%</span>
                              </td>
                              <td className="px-5 py-2.5 text-right">
                                <button
                                  onClick={() => removeProductMutation.mutate({ saleId: s.id, productId: p.id })}
                                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
          {sales.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              No flash sales yet. Create your first one!
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Flash Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Flash Sale' : 'New Flash Sale'}</h2>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Name *</label>
                <input {...register('name')} placeholder="e.g. Summer Mega Sale" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="datetime-local" {...register('start_date')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="datetime-local" {...register('end_date')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_featured')} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Product to Flash Sale</h2>
              <button onClick={() => { setShowProductModal(null); resetProd() }} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleProd(onAddProduct)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select {...regProd('product_id', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select a product…</option>
                  {allProducts.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>
                  ))}
                </select>
                {prodErrors.product_id && <p className="text-xs text-red-500 mt-1">{prodErrors.product_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price *</label>
                  <input type="number" step="0.01" {...regProd('price', { valueAsNumber: true })} placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {prodErrors.price && <p className="text-xs text-red-500 mt-1">{prodErrors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" {...regProd('quantity', { valueAsNumber: true })} defaultValue={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowProductModal(null); resetProd() }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={addProductMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60">
                  {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
