'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

interface ConnectBankProps {
  stripeAccountId?: string | null
}

export function ConnectBank({ stripeAccountId }: ConnectBankProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'incomplete'>('idle')
  const searchParams = useSearchParams()

  useEffect(() => {
    const connect = searchParams.get('connect')
    if (connect === 'success') setStatus('success')
    else if (connect === 'incomplete') setStatus('incomplete')
    else if (connect === 'error') setStatus('error')
  }, [searchParams])

  const isConnected = !!stripeAccountId && status !== 'incomplete'

  async function startConnect() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (e) {
      setStatus('error')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-white">Payouts</h2>
          <p className="text-sm text-white/40 mt-1">Connect your bank account to receive deposit payments from clients.</p>
        </div>
        {isConnected && (
          <span className="text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-1">
            ✓ Connected
          </span>
        )}
      </div>

      {status === 'success' && (
        <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3">
          Bank account connected! You can now receive deposit payments.
        </div>
      )}
      {status === 'error' && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
          Something went wrong. Please try again.
        </div>
      )}
      {status === 'incomplete' && (
        <div className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
          Setup incomplete. Click below to finish connecting your bank.
        </div>
      )}

      {!isConnected ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="h-6 w-6 rounded-full bg-ink-500/20 flex items-center justify-center text-xs text-ink-300 font-semibold">1</span>
            Click "Connect bank account"
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="h-6 w-6 rounded-full bg-ink-500/20 flex items-center justify-center text-xs text-ink-300 font-semibold">2</span>
            Complete Stripe's secure onboarding (2 min)
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="h-6 w-6 rounded-full bg-ink-500/20 flex items-center justify-center text-xs text-ink-300 font-semibold">3</span>
            Receive deposits directly to your bank every Friday
          </div>
          <Button onClick={startConnect} loading={loading} className="mt-2">
            Connect bank account →
          </Button>
          <p className="text-xs text-white/30 text-center">Powered by Stripe. No fees charged by TattooOS.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Payouts every Friday via Stripe Express</span>
          <Button variant="outline" size="sm" onClick={startConnect} loading={loading}>
            Manage payouts ↗
          </Button>
        </div>
      )}
    </div>
  )
}
