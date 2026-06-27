'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectItem } from '@/components/ui/select'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

interface ConnectBankProps {
  stripeAccountId?: string | null
}

const SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week (Fridays)' },
  { value: 'monthly', label: 'Once a month (1st)' },
]

export function ConnectBank({ stripeAccountId }: ConnectBankProps) {
  const [loading, setLoading] = useState(false)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'incomplete'>('idle')
  const [payoutSchedule, setPayoutSchedule] = useState('weekly')
  const searchParams = useSearchParams()
  const { toast } = useToast()

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
    } catch {
      setStatus('error')
      setLoading(false)
    }
  }

  async function updateSchedule(interval: string) {
    setPayoutSchedule(interval)
    setScheduleLoading(true)
    try {
      const res = await fetch('/api/stripe/connect/payout-schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      if (res.ok) {
        toast({ title: 'Payout schedule updated', type: 'success' })
      } else {
        toast({ title: 'Failed to update schedule', type: 'error' })
      }
    } catch {
      toast({ title: 'Failed to update schedule', type: 'error' })
    }
    setScheduleLoading(false)
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
            Choose how often you want to get paid
          </div>
          <Button onClick={startConnect} loading={loading} className="mt-2">
            Connect bank account →
          </Button>
          <p className="text-xs text-white/30 text-center">Powered by Stripe. No fees charged by TattooOS.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">Payouts via Stripe Express</p>
            <Button variant="outline" size="sm" onClick={startConnect} loading={loading}>
              Manage account ↗
            </Button>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-2 font-medium">Payout frequency</p>
            <Select
              value={payoutSchedule}
              onValueChange={updateSchedule}
              placeholder="Choose frequency"
            >
              {SCHEDULE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </Select>
            {scheduleLoading && (
              <p className="text-xs text-white/30 mt-1">Updating...</p>
            )}
            <p className="text-xs text-white/30 mt-2">Deposits are held by Stripe until your payout date, then sent directly to your bank.</p>
          </div>
        </div>
      )}
    </div>
  )
}
