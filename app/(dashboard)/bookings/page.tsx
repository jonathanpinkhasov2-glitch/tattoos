'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Plus, Search, Calendar, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime, formatMoney, bookingStatusColor, cn } from '@/lib/utils'
import type { Booking } from '@/types'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
]

export default function BookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [artistId, setArtistId] = useState<string | null>(null)

  useEffect(() => {
    loadArtist()
  }, [])

  useEffect(() => {
    if (artistId) loadBookings()
  }, [artistId, statusFilter])

  async function loadArtist() {
    const { data } = await supabase.from('studios').select('artists(id)').single()
    const id = (data as { artists: { id: string }[] } | null)?.artists?.[0]?.id
    if (id) setArtistId(id)
  }

  async function loadBookings() {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('artist_id', artistId!)
      .order('scheduled_at', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setBookings((data as Booking[]) ?? [])
    setLoading(false)
  }

  const filtered = bookings.filter(b =>
    search === '' ||
    b.client_name.toLowerCase().includes(search.toLowerCase()) ||
    b.client_email.toLowerCase().includes(search.toLowerCase()) ||
    b.tattoo_description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <Link href="/bookings/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New booking</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or tattoo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-48">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Status"
          >
            {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </Select>
        </div>
      </div>

      {/* Booking list */}
      <div className="rounded-xl border border-white/8 bg-surface-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-ink-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {filtered.map(booking => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group"
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-ink-500/20 flex items-center justify-center text-ink-300 font-semibold shrink-0">
                  {booking.client_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{booking.client_name}</p>
                    {!booking.deposit_paid && (
                      <span className="text-xs text-yellow-400 bg-yellow-400/10 rounded px-1.5 py-0.5 shrink-0">
                        No deposit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 truncate">
                    {booking.tattoo_description || 'No description'} · {booking.placement || 'No placement'}
                  </p>
                </div>

                {/* Date */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(booking.scheduled_at)}
                </div>

                {/* Amount */}
                {booking.session_price && (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-white/50 shrink-0">
                    <DollarSign className="h-3 w-3" />
                    {formatMoney(booking.session_price)}
                  </div>
                )}

                {/* Status */}
                <Badge className={cn('text-xs shrink-0 capitalize', bookingStatusColor(booking.status))}>
                  {booking.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
