import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'
import { formatDate, formatDateTime, formatMoney, bookingStatusColor, cn } from '@/lib/utils'
import type { Client, Booking } from '@/types'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data: clientRaw } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single()

  const client = clientRaw
    ? { ...clientRaw, name: [clientRaw.first_name, clientRaw.last_name].filter(Boolean).join(' ') } as Client
    : null

  if (!client) notFound()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', client.id)
    .order('scheduled_at', { ascending: false }) as { data: Booking[] | null }

  const totalSpent = (bookings ?? []).filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_paid ?? 0), 0)
  const sessionCount = (bookings ?? []).filter(b => b.status === 'completed').length

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Clients</Button>
        </Link>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-ink-500/20 flex items-center justify-center text-ink-300 font-bold text-2xl shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-white/50">
                <Mail className="h-3.5 w-3.5" /> {client.email}
              </div>
              {client.phone && (
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Phone className="h-3.5 w-3.5" /> {client.phone}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-white/50">
                <Calendar className="h-3.5 w-3.5" /> Client since {formatDate(client.created_at)}
              </div>
            </div>
          </div>
          {client.is_blocked && <Badge variant="danger">Blocked</Badge>}
        </div>

        {client.notes && (
          <div className="mt-4 p-3 rounded-lg bg-white/4 border border-white/8">
            <p className="text-xs text-white/40 mb-1">Notes</p>
            <p className="text-sm text-white/70">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sessions', value: sessionCount },
          { label: 'Total spent', value: formatMoney(totalSpent) },
          { label: 'Total bookings', value: bookings?.length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-surface-1 p-4 text-center">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Booking history */}
      <div className="rounded-xl border border-white/8 bg-surface-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="font-semibold text-white">Session history</h2>
        </div>
        <div className="divide-y divide-white/6">
          {(!bookings || bookings.length === 0) && (
            <p className="px-6 py-8 text-center text-sm text-white/30">No sessions yet</p>
          )}
          {bookings?.map(booking => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {booking.tattoo_description || 'Tattoo session'}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{formatDateTime(booking.scheduled_at)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {booking.session_price && (
                  <span className="text-sm text-white/60">{formatMoney(booking.session_price)}</span>
                )}
                <Badge className={cn('text-xs capitalize', bookingStatusColor(booking.status))}>
                  {booking.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
