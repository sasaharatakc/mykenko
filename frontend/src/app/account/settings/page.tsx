'use client'

import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z.string().min(8, 'At least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { customer, setCustomer } = useAuthStore()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
    },
  })

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSaveProfile = async (data: ProfileForm) => {
    setProfileLoading(true)
    try {
      const res = await authApi.updateProfile(data)
      setCustomer(res.data.data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    setPasswordLoading(true)
    try {
      await authApi.changePassword(data)
      toast.success('Password changed')
      resetPassword()
    } catch {
      toast.error('Current password is incorrect')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>
      </div>

      <div className="container-narrow py-8 max-w-2xl">
        {/* Profile */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Profile Information</h2>
          <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" {...regProfile('name')} className="input" />
              {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" {...regProfile('email')} className="input" />
              {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input type="tel" {...regProfile('phone')} className="input" />
            </div>
            <button type="submit" disabled={profileLoading} className="btn-primary disabled:opacity-60">
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Change Password</h2>
          <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  {...regPassword('current_password')}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.current_password && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.current_password.message}</p>
              )}
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  {...regPassword('password')}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.password.message}</p>
              )}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" {...regPassword('password_confirmation')} className="input" />
              {passwordErrors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.password_confirmation.message}</p>
              )}
            </div>
            <button type="submit" disabled={passwordLoading} className="btn-primary disabled:opacity-60">
              {passwordLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
