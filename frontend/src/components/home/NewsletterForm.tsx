'use client'

import { useState } from 'react'
import { newsletterApi } from '@/lib/api'
import { Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await newsletterApi.subscribe(email)
      toast.success('Subscribed successfully!')
      setEmail('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to subscribe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-200" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-primary-100 text-sm focus:outline-none focus:border-white focus:bg-white/30 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors disabled:opacity-70 whitespace-nowrap"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
      </button>
    </form>
  )
}
