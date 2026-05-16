'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { checkoutApi } from '@/lib/api'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { ShoppingCart, ChevronRight, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialise once outside of render to avoid re-creating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().min(2),
  zip_code: z.string().optional(),
  shipping_method: z.string().min(1),
  payment_method: z.enum(['stripe', 'paypal', 'cod', 'bank_transfer']),
  note: z.string().optional(),
  same_billing: z.boolean(),
  coupon_code: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof schema>

const FALLBACK_SHIPPING_OPTIONS = [
  { value: 'free', label: 'Free Shipping', desc: '7-10 business days', cost: 0 },
  { value: 'standard', label: 'Standard Shipping', desc: '5-7 business days', cost: 5.99 },
  { value: 'express', label: 'Express Shipping', desc: '2-3 business days', cost: 14.99 },
]

const PAYMENT_METHODS = [
  { value: 'stripe', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️' },
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
]

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111827',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

// ─── Inner form (needs to be inside <Elements> to call useStripe/useElements) ─

function CheckoutForm() {
  const router = useRouter()
  const { items, summary: rawSummary, coupon, clearCart } = useCartStore()
  const summary = rawSummary ?? { sub_total: 0, subtotal: 0, item_count: 0, discount: 0, tax: 0, shipping: 0, total: 0 }
  const { isAuthenticated, customer } = useAuthStore()
  const [placing, setPlacing] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(coupon)
  const [cardReady, setCardReady] = useState(false)

  const stripe = useStripe()
  const elements = useElements()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      shipping_method: 'standard',
      payment_method: 'stripe',
      same_billing: true,
    },
  })

  const shippingMethod = watch('shipping_method')
  const paymentMethod = watch('payment_method')
  const watchedCountry = watch('country')
  const watchedState = watch('state')
  const watchedZip = watch('zip_code')

  // Fetch live shipping rates once the user has entered a country
  const { data: ratesData, isLoading: ratesLoading } = useQuery({
    queryKey: ['shipping-rates', watchedCountry, watchedState, watchedZip],
    queryFn: () =>
      checkoutApi.getShippingRates({
        country: watchedCountry,
        state: watchedState || undefined,
        zip_code: watchedZip || undefined,
      }).then((r) => r.data as Array<{ method: string; label: string; cost: number }>),
    enabled: !!watchedCountry && watchedCountry.length >= 2,
    staleTime: 60_000,
  })

  const shippingOptions = ratesData
    ? ratesData.map((r) => ({
        value: r.method,
        label: r.label.replace(/\s*\(.*?\)\s*$/, ''),
        desc: r.label.match(/\(([^)]+)\)/)?.[1] ?? '',
        cost: r.cost,
      }))
    : FALLBACK_SHIPPING_OPTIONS

  const selectedShipping = shippingOptions.find((o) => o.value === shippingMethod)
  const shippingCost = selectedShipping?.cost ?? 5.99
  const discount = appliedCoupon?.discount ?? 0
  const total = summary.sub_total + shippingCost - discount

  const onSubmit = async (data: CheckoutFormData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order.')
      router.push('/login?redirect=/checkout')
      return
    }
    setPlacing(true)
    try {
      let paymentIntentId: string | undefined

      // ── Stripe card payment ──────────────────────────────────────────────
      if (data.payment_method === 'stripe') {
        if (!stripe || !elements) {
          toast.error('Stripe has not loaded yet. Please try again.')
          setPlacing(false)
          return
        }

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          toast.error('Please enter your card details.')
          setPlacing(false)
          return
        }

        // 1. Create a PaymentIntent on the backend (backend expects dollars, not cents)
        const intentRes = await checkoutApi.getPaymentIntent({
          amount: total,
          currency: 'usd',
        })
        const clientSecret: string = (intentRes.data as any).client_secret

        // 2. Confirm the payment with the CardElement
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.name,
              email: data.email,
              phone: data.phone,
            },
          },
        })

        if (error) {
          toast.error(error.message ?? 'Payment failed. Please try again.')
          setPlacing(false)
          return
        }

        paymentIntentId = paymentIntent?.id
      }
      // ────────────────────────────────────────────────────────────────────

      const payload = {
        shipping_address: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zip_code: data.zip_code,
        },
        shipping_method: data.shipping_method,
        payment_method: data.payment_method,
        coupon_code: data.coupon_code || appliedCoupon?.code,
        note: data.note,
        ...(paymentIntentId ? { payment_intent_id: paymentIntentId } : {}),
      }

      const { data: result } = await checkoutApi.placeOrder(payload)
      await clearCart()
      toast.success('Order placed successfully!')
      router.push(`/account/orders/${result.order.code}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-narrow py-24 flex flex-col items-center gap-4 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200" />
        <h2 className="font-display text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500">Add items before proceeding to checkout.</p>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-narrow py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-500">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-primary-500">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full Name *</label>
                  <input {...register('name')} className="input" placeholder="John Doe" />
                  {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input {...register('email')} type="email" className="input" />
                  {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input {...register('phone')} className="input" placeholder="+1 (555) 000-0000" />
                  {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address *</label>
                  <input {...register('address')} className="input" placeholder="123 Main St, Apt 4B" />
                  {errors.address && <p className="text-xs text-danger mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="label">City *</label>
                  <input {...register('city')} className="input" />
                  {errors.city && <p className="text-xs text-danger mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">State / Province</label>
                  <input {...register('state')} className="input" />
                </div>
                <div>
                  <label className="label">Country *</label>
                  <input {...register('country')} className="input" defaultValue="United States" />
                  {errors.country && <p className="text-xs text-danger mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <label className="label">ZIP / Postal Code</label>
                  <input {...register('zip_code')} className="input" />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">
                Shipping Method
                {ratesLoading && <Loader2 className="inline-block w-3.5 h-3.5 ml-2 animate-spin text-gray-400" />}
              </h2>
              <div className="space-y-3">
                {ratesLoading
                  ? [...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 skeleton rounded-xl" />
                  ))
                  : shippingOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors hover:border-gray-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                      <div className="flex items-center gap-3">
                        <input type="radio" {...register('shipping_method')} value={opt.value} className="text-primary-500" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{opt.label}</p>
                          {opt.desc && <p className="text-xs text-gray-400">{opt.desc}</p>}
                        </div>
                      </div>
                      <span className="font-semibold text-sm text-gray-900">
                        {opt.cost === 0 ? 'FREE' : formatPrice(opt.cost)}
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label key={pm.value} className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors hover:border-gray-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                    <input type="radio" {...register('payment_method')} value={pm.value} className="text-primary-500" />
                    <span className="text-lg">{pm.icon}</span>
                    <span className="font-medium text-sm text-gray-900">{pm.label}</span>
                  </label>
                ))}
              </div>

              {/* ── Stripe CardElement ── */}
              {paymentMethod === 'stripe' && (
                <div className="mt-4 rounded-xl border-2 border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Secured by Stripe · Your card details are never stored on our servers</span>
                  </div>
                  <div className="p-4">
                    <CardElement
                      options={CARD_ELEMENT_OPTIONS}
                      onChange={(e) => setCardReady(e.complete)}
                    />
                  </div>
                  <div className="px-4 pb-3 flex gap-2 items-center">
                    {/* Card brand logos via Stripe's hosted assets */}
                    {['visa', 'mastercard', 'amex', 'discover'].map((brand) => (
                      <img
                        key={brand}
                        src={`https://js.stripe.com/v3/fingerprinted/img/${brand}-${brand === 'visa' ? '729c05e715' : brand === 'mastercard' ? 'f5c191e3c9' : brand === 'amex' ? '25d77a00e9' : '94125db723'}.svg`}
                        alt={brand}
                        className="h-5 opacity-60"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  Payment will be collected when your order is delivered.
                </div>
              )}
              {paymentMethod === 'bank_transfer' && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
                  Bank transfer details will be sent to your email after placing the order.
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <div className="mt-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
                  You will be redirected to PayPal to complete your payment.
                </div>
              )}
            </div>

            {/* Note */}
            <div className="card p-6">
              <h2 className="font-display text-base font-semibold text-gray-900 mb-3">Order Note (Optional)</h2>
              <textarea
                {...register('note')}
                rows={3}
                className="input resize-none"
                placeholder="Special instructions for your order…"
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                      <Image src={getImageUrl(item.product?.image)} alt={item.product?.name ?? ''} fill className="object-contain p-1" sizes="56px" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-500 text-white text-2xs font-bold flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.product?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.sub_total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-success font-medium">FREE</span> : formatPrice(shippingCost)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={placing || (paymentMethod === 'stripe' && !cardReady)}
                className="btn-primary w-full mt-6 gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Lock className="w-4 h-4" /> Place Order · {formatPrice(total)}</>
                )}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                By placing your order, you agree to our{' '}
                <Link href="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Public export: wraps form in Stripe Elements provider ───────────────────

export function CheckoutContent() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
