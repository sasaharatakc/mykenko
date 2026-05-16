'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  phone: z.string().optional(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data)
      toast.success('Account created successfully!')
      router.push('/account')
    } catch (error: any) {
      const msgs = error.response?.data?.errors
      if (msgs) {
        Object.values(msgs).flat().forEach((m: any) => toast.error(m))
      } else {
        toast.error(error.response?.data?.message || 'Registration failed.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="font-display text-2xl font-bold text-primary-500">Shofy</Link>
            <h1 className="font-display text-xl font-semibold text-gray-900 mt-3">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands of shoppers</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name')} className="input" placeholder="John Doe" />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone (Optional)</label>
              <input {...register('phone')} className="input" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input {...register('password_confirmation')} type="password" className="input" placeholder="Repeat password" />
              {errors.password_confirmation && <p className="text-xs text-danger mt-1">{errors.password_confirmation.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 gap-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
