'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressApi } from '@/lib/api'
import type { CustomerAddress } from '@/types'
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
})

type AddressForm = z.infer<typeof addressSchema>

export default function AddressesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<CustomerAddress | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: addresses, isLoading } = useQuery<CustomerAddress[]>({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list().then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const saveMutation = useMutation({
    mutationFn: (data: AddressForm) =>
      editing ? addressApi.update(editing.id, data) : addressApi.create(data),
    onSuccess: () => {
      toast.success(editing ? 'Address updated' : 'Address added')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setEditing(null)
      setShowForm(false)
      reset()
    },
    onError: () => toast.error('Failed to save address'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressApi.delete(id),
    onSuccess: () => {
      toast.success('Address removed')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  const defaultMutation = useMutation({
    mutationFn: (id: number) => addressApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  const openEdit = (addr: CustomerAddress) => {
    setEditing(addr)
    reset({
      name: addr.name,
      phone: addr.phone ?? '',
      address: addr.address,
      city: addr.city ?? '',
      state: addr.state ?? undefined,
      zip_code: addr.zip_code ?? undefined,
      country: addr.country ?? '',
    })
    setShowForm(true)
  }

  const openNew = () => {
    setEditing(null)
    reset({})
    setShowForm(true)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-gray-900">Saved Addresses</h1>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
      </div>

      <div className="container-narrow py-8">
        {/* Address Form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">{editing ? 'Edit Address' : 'New Address'}</h2>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name', label: 'Full Name', colSpan: 1 },
                { name: 'phone', label: 'Phone', colSpan: 1 },
                { name: 'address', label: 'Street Address', colSpan: 2 },
                { name: 'city', label: 'City', colSpan: 1 },
                { name: 'state', label: 'State / Province', colSpan: 1 },
                { name: 'zip_code', label: 'ZIP / Postal Code', colSpan: 1 },
                { name: 'country', label: 'Country', colSpan: 1 },
              ].map(({ name, label, colSpan }) => (
                <div key={name} className={colSpan === 2 ? 'sm:col-span-2' : ''}>
                  <label className="label">{label}</label>
                  <input
                    type="text"
                    {...register(name as keyof AddressForm)}
                    className="input"
                    placeholder={label}
                  />
                  {errors[name as keyof AddressForm] && (
                    <p className="text-xs text-red-500 mt-1">{errors[name as keyof AddressForm]?.message}</p>
                  )}
                </div>
              ))}

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="btn-primary disabled:opacity-60"
                >
                  {saveMutation.isPending ? 'Saving…' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); reset() }}
                  className="btn border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="h-4 skeleton rounded w-1/2" />
                <div className="h-3 skeleton rounded" />
                <div className="h-3 skeleton rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : !addresses?.length ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <MapPin className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500">No saved addresses. Add one to speed up checkout.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`card p-5 ${addr.is_default ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{addr.name}</p>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-2xs text-primary-500 font-medium mt-0.5">
                        <Star className="w-3 h-3 fill-primary-500" /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(addr)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(addr.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <address className="mt-3 text-sm text-gray-600 not-italic leading-relaxed">
                  <p>{addr.address}</p>
                  <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip_code}</p>
                  <p>{addr.country}</p>
                  {addr.phone && <p className="mt-1 text-gray-500">{addr.phone}</p>}
                </address>

                {!addr.is_default && (
                  <button
                    onClick={() => defaultMutation.mutate(addr.id)}
                    className="mt-4 text-xs text-primary-500 hover:underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
