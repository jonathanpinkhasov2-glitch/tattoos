import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Users, Calendar, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { formatMoney, formatDateTime, bookingStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Booking, Studio, Artist } from '@/types'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Fetch studio
  const { data: studio } = await supabase
    .from('studios')
    .select('*, artists(*)')
    .eq('owner_id', session.user.id)
    .single() as { data: (Studio & { artists: Artist[] }) | null }

  if (!studio) redirect('/onboarding')

  const artistId = studio.artists?.[0]?.id

  // This month's bookings
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('artist_id', artistId)
    .gte('scheduled_at', startOfMonth.toISOString())
    .order('scheduled_at', { ascending: true })

  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, clients(*)')
    .eq('artist_id', artistId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  const { data: pendingConsent } = await supabase
    .from('consent_forms')
    .select('*, bookings!inner(artist_id, client_name, scheduled_at)')
    .eq('bookings.artist_id', artistId)
    .eq('status', 'pending')
    .limit(5)

  const { count: waitlistCount } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', artistId)
    .eq('status', 'waiting')

  const bookings = (monthBookings ?? []) as Booking[]
  const revenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.total_paid, 0)
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const pendingCount = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length

  const isTrial = studio.subscription_status === 'trialing'
  const trialDaysLeft = studio.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(studio.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href={`/book/${studio.artists?.[0]?.slug ?? ''}`} target="_blank">
          <Button variant="outline" size="sm">
            View booking page ↗
          </Button>
        </Link>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="rounded-xl border border-ink-500/30 bg-ink-500/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-ink-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">
                {trialDaysLeft} days left in your free trial
              </p>
              <p className="text-xs text-white/50">Add a payment method to keep access after your trial ends.</p>
            </div>
          </div>
          <Link href="/settings/billing">
            <Button size="sm">Upgrade now</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue this month"
          value={formatMoney(revenue)}
          delta="From completed sessions"
          deltaType="neutral"
          icon={DollarSign}
          iconColor="text-green-400"
        />
        <StatCard
          label="Bookings this month"
          value={bookings.length}
          delta={`${completedCount} completed`}
          deltaType="neutral"
          icon={Calendar}
          iconColor="text-ink-400"
        />
        <StatCard
          label="Pending bookings"
          value={pendingCount}
          delta="Need confirmation"
          deltaType={pendingCount > 0 ? 'up' : 'neutral'}
          icon={Clock}
          iconColor="text-yellow-400"
        />
        <StatCard
          label="Waitlist"
          value={waitlistCount ?? 0}
          delta="Clients waiting"
          deltaType="neutral"
          icon={Users}
          iconColor="text-blue-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <div className="rounded-xl border border-white/8 bg-surface-1">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
            <h2 className="font-semibold text-white">Upcoming bookings</h2>
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-white/6">
            {upcomingBookings?.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-white/30">No upcoming bookings</p>
            )}
            {upcomingBookings?.map((booking: Booking & { clients?: unknown }) => (
              <Link key={booking.id} href={`/bookings/${booking.id}`} className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="h-9 w-9 rounded-full bg-ink-500/20 flex items-center justify-center text-ink-300 font-semibold text-sm shrink-0">
                  {booking.client_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{booking.client_name}</p>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{booking.tattoo_description || 'No description'}</p>
                  <p className="text-xs text-white/30 mt-0.5">{formatDateTime(booking.scheduled_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'} className="text-xs">
                    {booking.status}
                  </Badge>
                  {!booking.deposit_paid && (
                    <span className="text-xs text-yellow-400">No deposit</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Consent forms pending */}
        <div className="rounded-xl border border-white/8 bg-surface-1">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
            <h2 className="font-semibold text-white">Consent forms</h2>
            <Link href="/bookings?filter=consent">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                Manage <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-white/6">
            {pendingConsent?.length === 0 && (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-400/40 mx-auto mb-2" />
                <p className="text-sm text-white/30">All consent forms signed</p>
              </div>
            )}
            {pendingConsent?.map((form: { id: string; bookings: { client_name: string; scheduled_at: string } | { client_name: string; scheduled_at: string }[] }) => {
              const booking = Array.isArray(form.bookings) ? form.bookings[0] : form.bookings
              return (
                <div key={form.id} className="flex items-center gap-4 px-6 py-4">
                  <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{booking?.client_name}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Session: {booking ? formatDateTime(booking.scheduled_at) : '—'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs">
                    Send reminder
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
