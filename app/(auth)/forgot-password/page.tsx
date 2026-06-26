'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      toast({ title: 'Error', description: error.message, type: 'error' })
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-white/8 bg-surface-1 p-8 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
        <div>
          <h1 className="text-xl font-bold text-white">Check your email</h1>
          <p className="text-white/50 text-sm mt-2">
            We sent a password reset link to <span className="text-white">{email}</span>
          </p>
        </div>
        <Link href="/login" className="block">
          <Button variant="outline" className="w-full">Back to login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/8 bg-surface-1 p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
      <p className="text-white/50 text-sm mb-8">Enter your email and we'll send a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Remember it?{' '}
        <Link href="/login" className="text-ink-400 hover:text-ink-300 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
