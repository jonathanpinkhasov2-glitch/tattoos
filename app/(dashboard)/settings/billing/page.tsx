'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Zap, Building2, Crown } from 'lucide-react'
import type { Studio } from '@/types'

const PLANS = [
  {
    id: 'solo',
    name: 'Solo Artist',
    price: 39,
    icon: Zap,
    color: 'text-ink-400',
    features: [
      'Unlimited bookings',
      'Client management',
      'Digital consent forms',
      'Deposit collection',
      'Public booking page',
      'Waitlist management',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 79,
    icon: Building2,
    color: 'text-blue-400',
    badge: 'Most popular',
    features: [
      'Everything in Solo',
      'Up to 5 artists',
      'Studio dashboard',
      'Team management',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Studio',
    price: 19,
    priceSuffix: '/artist · 5 seat min',
    icon: Crown,
    color: 'text-yellow-400',
    features: [
      'Everything in Studio',
      'Unlimited artists',
      'Advanced analytics',
      'API access',
      'White-label booking',
      'Dedicated support',
    ],
  },
]

export default function BillingPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [studio, setStudio] = useState<Studio | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('studios').select('*').single().then(({ data }) => {
      setStudio(data as Studio)
    })

    if (searchParams.get('success')) {
      toast({ title: 'Subscription activated!', type: 'success' })
    }
  }, [])

  const subscribe = async (planId: string) => {
    setLoading(planId)
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else toast({ title: error ?? 'Failed to start checkout', type: 'error' })
    setLoading(null)
  }

  const openPortal = async () => {
    setLoading('portal')
    const res = await fetch('/api/billing-portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else toast({ title: error ?? 'No billing account found', type: 'error' })
    setLoading(null)
  }

  const isTrial = studio?.subscription_status === 'trialing'
  const isActive = studio?.subscription_status === 'active'
  const currentPlan = studio?.subscription_plan

  const trialDaysLeft = studio?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(studio.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Billing & plan</h1>

      {/* Current status */}
      {(isTrial || isActive) && (
        <div className="rounded-xl border border-white/8 bg-surface-1 p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              {isTrial ? `Free trial — ${trialDaysLeft} days remaining` : `${currentPlan?.charAt(0).toUpperCase()}${currentPlan?.slice(1)} plan`}
            </p>
            <p className="text-sm text-white/40 mt-1">
              {isTrial ? 'Upgrade to keep access after your trial ends.' : 'Your subscription is active.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isActive ? 'success' : 'warning'}>
              {studio?.subscription_status}
            </Badge>
            {isActive && (
              <Button variant="outline" size="sm" loading={loading === 'portal'} onClick={openPortal}>
                Manage billing
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const Icon = plan.icon
          const isCurrent = currentPlan === plan.id && isActive

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-5 space-y-4 ${
                isCurrent ? 'border-ink-500/60 bg-ink-500/8' : 'border-white/8 bg-surface-1'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-ink-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${plan.color}`} />
                <p className="font-semibold text-white">{plan.name}</p>
                {isCurrent && <Badge variant="success" className="ml-auto text-xs">Current</Badge>}
              </div>

              <div>
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-white/40 text-sm">/mo{plan.priceSuffix ?? ''}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <Button
                  className="w-full"
                  variant={plan.id === 'studio' ? 'default' : 'outline'}
                  loading={loading === plan.id}
                  onClick={() => subscribe(plan.id)}
                >
                  {isTrial ? 'Start now' : 'Switch plan'}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-white/25 text-center">
        All plans include a 14-day free trial. Cancel anytime. Prices in USD.
      </p>
    </div>
  )
}
