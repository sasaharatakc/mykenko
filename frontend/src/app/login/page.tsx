'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { useUserAuthStore } from '@/store/userAuthStore'
import { useCartStore } from '@/store/cartStore'
import { Eye, EyeOff, Loader2, LayoutDashboard, Store, ShoppingBag, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('メールアドレスが無効です'),
  password: z.string().min(6, 'パスワードは6文字以上です'),
})

type FormData = z.infer<typeof schema>

type Mode = 'customer' | 'admin' | 'vendor'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') ?? ''

  // Determine initial mode from redirect param
  const initialMode: Mode =
    rawRedirect.startsWith('/admin') ? 'admin' :
    rawRedirect.startsWith('/vendor') ? 'vendor' : 'customer'

  const [mode, setMode] = useState<Mode>(initialMode)
  const [showPassword, setShowPassword] = useState(false)

  const { login: customerLogin, isLoading: customerLoading } = useAuthStore()
  const { login: userLogin, isLoading: userLoading } = useUserAuthStore()
  const { fetchCart } = useCartStore()

  const isLoading = customerLoading || userLoading

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const isBackOffice = mode === 'admin' || mode === 'vendor'

  // ---- テスト用クイックフィル（開発環境のみ） ----
  const fillDemo = (email: string, pass: string) => {
    setValue('email', email)
    setValue('password', pass)
  }

  const resolveRedirect = (roles?: string[]): string => {
    // Explicit redirect takes priority (except generic /account)
    if (rawRedirect && rawRedirect !== '/account') return rawRedirect
    if (roles?.includes('admin')) return '/admin'
    if (roles?.includes('vendor')) return '/vendor'
    return rawRedirect || '/account'
  }

  const onSubmit = async (data: FormData) => {
    if (isBackOffice) {
      // バックオフィスログイン専用
      try {
        await userLogin(data.email, data.password)
        const user = useUserAuthStore.getState().user
        toast.success('ログインしました')
        router.push(resolveRedirect(user?.roles))
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'メールアドレスまたはパスワードが違います')
      }
      return
    }

    // 顧客ログイン（失敗時はバックオフィスを試みる）
    try {
      await customerLogin(data.email, data.password)
      await fetchCart()
      toast.success('ログインしました')
      router.push(rawRedirect || '/account')
    } catch {
      try {
        await userLogin(data.email, data.password)
        const user = useUserAuthStore.getState().user
        await fetchCart()
        toast.success('ログインしました')
        router.push(resolveRedirect(user?.roles))
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'メールアドレスまたはパスワードが違います')
      }
    }
  }

  const modeConfig = {
    customer: {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: 'ログイン',
      subtitle: 'アカウントにサインインしてください',
      color: 'text-primary-500',
      bg: 'bg-primary-50',
      border: 'border-primary-200',
    },
    admin: {
      icon: <Shield className="w-5 h-5" />,
      title: '管理者ログイン',
      subtitle: '管理画面にアクセスするにはログインしてください',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
    vendor: {
      icon: <Store className="w-5 h-5" />,
      title: 'ベンダーログイン',
      subtitle: 'ベンダーダッシュボードにアクセスするにはログインしてください',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
  }

  const cfg = modeConfig[mode]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {(
            [
              { key: 'customer', label: 'お客様', Icon: ShoppingBag },
              { key: 'admin', label: '管理者', Icon: LayoutDashboard },
              { key: 'vendor', label: 'ベンダー', Icon: Store },
            ] as { key: Mode; label: string; Icon: any }[]
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`${cfg.bg} ${cfg.border} border-b px-8 py-5 flex items-center gap-3`}>
            <div className={`${cfg.color}`}>{cfg.icon}</div>
            <div>
              <h1 className={`font-display text-lg font-bold ${cfg.color}`}>{cfg.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.subtitle}</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-4">
            {/* Demo credentials hint */}
            {(mode === 'admin') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 space-y-1">
                  <p className="font-semibold">テスト用管理者アカウント</p>
                  <p>メール: <code className="font-mono bg-amber-100 px-1 rounded">admin@shofy.com</code></p>
                  <p>パスワード: <code className="font-mono bg-amber-100 px-1 rounded">admin123</code></p>
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@shofy.com', 'admin123')}
                    className="text-amber-800 font-medium underline underline-offset-2 hover:no-underline"
                  >
                    → 自動入力する
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  {...register('email')}
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {mode === 'customer' && (
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-primary-500 hover:underline">
                    パスワードをお忘れの方
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
                  mode === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  mode === 'vendor' ? 'bg-violet-600 hover:bg-violet-700' :
                  'bg-primary-500 hover:bg-primary-600'
                } disabled:opacity-60`}
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> ログイン中…</>
                  : 'ログイン'
                }
              </button>
            </form>

            {mode === 'customer' && (
              <p className="text-center text-sm text-gray-500">
                アカウントをお持ちでない方は{' '}
                <Link href="/register" className="text-primary-500 font-medium hover:underline">
                  新規登録
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Quick nav */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            ショップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
