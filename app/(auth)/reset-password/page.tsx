'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast({ title: 'Passwords don\'t match', type: 'error' })
      return
    }
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'At least 8 characters required', type: 'error' })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast({ title: 'Failed to reset password', description: error.message, type: 'error' })
    } else {
      toast({ title: 'Password updated!', type: 'success' })
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-white/8 bg-surface-1 p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
      <p className="text-white/50 text-sm mb-8">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
          autoComplete="new-password"
          hint="At least 8 characters"
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" loading={loading}>Update password</Button>
      </form>
    </div>
  )
}
