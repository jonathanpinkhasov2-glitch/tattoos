'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { slugify } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'account' | 'studio'>('account')
  const [form, setForm] = useState({
    email: '', password: '', name: '', studioName: '', artistName: '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast({ title: 'Password too short', description: 'At least 8 characters required', type: 'error' })
      return
    }
    setStep('studio')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name } },
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned')

      // Create studio + artist via API
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studio_name: form.studioName,
          artist_name: form.artistName || form.name,
        }),
      })
      if (!res.ok) throw new Error('Failed to create studio')

      toast({ title: 'Welcome to TattooOS! 🎉', description: '14-day free trial started', type: 'success' })
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast({ title: 'Signup failed', description: message, type: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-white/8 bg-surface-1 p-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {(['account', 'studio'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-ink-600 text-white' :
              (i === 0 && step === 'studio') ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
              'bg-white/8 text-white/30'
            }`}>
              {i === 0 && step === 'studio' ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs ${step === s ? 'text-white' : 'text-white/30'}`}>
              {s === 'account' ? 'Your account' : 'Studio setup'}
            </span>
            {i < 1 && <div className="h-px w-6 bg-white/15 mx-1" />}
          </div>
        ))}
      </div>

      {step === 'account' ? (
        <>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-white/50 text-sm mb-8">14-day free trial · No credit card required</p>
          <form onSubmit={handleAccount} className="space-y-4">
            <Input label="Your name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" required />
            <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" required autoComplete="email" />
            <Input label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" required autoComplete="new-password" hint="At least 8 characters" />
            <Button type="submit" className="w-full">Continue →</Button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-white mb-1">Set up your studio</h1>
          <p className="text-white/50 text-sm mb-8">This is what clients will see when they book you.</p>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Studio name"
              value={form.studioName}
              onChange={e => set('studioName', e.target.value)}
              placeholder="e.g. Blackline Studio"
              required
              hint={form.studioName ? `Booking URL: tattooos.app/book/${slugify(form.studioName)}` : undefined}
            />
            <Input
              label="Your artist name"
              value={form.artistName}
              onChange={e => set('artistName', e.target.value)}
              placeholder={form.name || 'Your artist name'}
              hint="Can be different from your legal name"
            />
            <Button type="submit" className="w-full" loading={loading}>Create my account</Button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{' '}
        <Link href="/login" className="text-ink-400 hover:text-ink-300 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
