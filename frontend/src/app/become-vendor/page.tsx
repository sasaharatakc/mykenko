'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUserAuthStore } from '@/store/userAuthStore'
import { storeApi } from '@/lib/api'
import { Store, CheckCircle2, ArrowRight, Package, TrendingUp, Shield, Headphones } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const storeSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type StoreForm = z.infer<typeof storeSchema>

const BENEFITS = [
  { Icon: Package, title: 'Easy Product Management', desc: 'Upload and manage your products with our intuitive dashboard.' },
  { Icon: TrendingUp, title: 'Grow Your Sales', desc: 'Reach thousands of buyers actively shopping on Shofy.' },
  { Icon: Shield, title: 'Secure Payments', desc: 'Get paid reliably with automatic payouts to your account.' },
  { Icon: Headphones, title: '24/7 Vendor Support', desc: 'Our dedicated team is here to help you succeed.' },
]

export default function BecomeVendorPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { setVendorAuth } = useUserAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
  })

  const onSubmit = async (data: StoreForm) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/become-vendor')
      return
    }
    setLoading(true)
    try {
      const res = await storeApi.register(data)
      // Backend returns a vendor user token — store it so the user can
      // immediately access the vendor dashboard without logging in again.
      if (res.data?.token && res.data?.user) {
        setVendorAuth(res.data.token, res.data.user)
      }
      setSuccess(true)
      toast.success('Store created! Welcome to Shofy marketplace.')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create store'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container-narrow py-16 text-center">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="font-display text-4xl font-bold">Start Selling on Shofy</h1>
          <p className="text-primary-100 mt-3 text-lg max-w-xl mx-auto">
            Join thousands of vendors and reach millions of shoppers. Set up your store in minutes.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-narrow py-12 max-w-lg mx-auto">
        {success ? (
          <div className="card p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-gray-900">Store Created!</h2>
            <p className="text-gray-500 mt-2">Your application is pending admin approval. Once approved you can start adding products.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Link href="/vendor" className="btn-primary flex items-center gap-2">
                Go to Vendor Hub <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/shop" className="btn border border-gray-200 text-gray-700 hover:bg-gray-50">
                Browse Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-5">Create Your Store</h2>

            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-700">
                You need to <Link href="/login?redirect=/become-vendor" className="font-medium underline">sign in</Link> before creating a store.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Store Name <span className="text-red-500">*</span></label>
                <input type="text" {...register('name')} className="input" placeholder="My Awesome Store" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input resize-none"
                  placeholder="Tell customers what you sell…"
                />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input type="tel" {...register('phone')} className="input" />
              </div>
              <div>
                <label className="label">Address (optional)</label>
                <input type="text" {...register('address')} className="input" placeholder="City, Country" />
              </div>

              <button
                type="submit"
                disabled={loading || !isAuthenticated}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? 'Creating…' : 'Create Store'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
