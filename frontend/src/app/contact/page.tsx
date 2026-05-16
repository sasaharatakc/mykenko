'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
    reset()
    toast.success('Message sent! We\'ll get back to you soon.')
  }

  const INFO = [
    {
      Icon: MapPin,
      label: 'Address',
      value: '123 Commerce Street, New York, NY 10001',
    },
    {
      Icon: Phone,
      label: 'Phone',
      value: '+1 (234) 567-890',
      href: 'tel:+1234567890',
    },
    {
      Icon: Mail,
      label: 'Email',
      value: 'support@shofy.com',
      href: 'mailto:support@shofy.com',
    },
    {
      Icon: Clock,
      label: 'Hours',
      value: 'Mon–Fri: 9am – 6pm EST',
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-10 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-500 mt-2">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
        </div>
      </div>

      <div className="container-narrow py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {INFO.map(({ Icon, label, value, href }) => (
              <div key={label} className="card p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-gray-900 hover:text-primary-500 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              {sent ? (
                <div className="py-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Send className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-900">Message Sent!</h3>
                  <p className="text-gray-500">Thank you for reaching out. We&apos;ll reply within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="btn-primary mt-2">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name</label>
                      <input type="text" {...register('name')} className="input" placeholder="John Doe" />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input type="email" {...register('email')} className="input" placeholder="john@example.com" />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <input type="text" {...register('subject')} className="input" placeholder="How can we help?" />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className="input resize-none"
                      placeholder="Tell us more about your inquiry…"
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
