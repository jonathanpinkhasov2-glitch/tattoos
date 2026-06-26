'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, parseISO } from 'date-fns'
import { formatTime, bookingStatusColor, cn } from '@/lib/utils'
import Link from 'next/link'
import type { Booking } from '@/types'

export default function CalendarPage() {
  const supabase = createClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [currentMonth])

  async function loadBookings() {
    setLoading(true)
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)

    const { data: studio } = await supabase
      .from('studios')
      .select('artists(id)')
      .single()

    const artistId = (studio as { artists: { id: string }[] } | null)?.artists?.[0]?.id
    if (!artistId) { setLoading(false); return }

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('artist_id', artistId)
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .not('status', 'eq', 'cancelled')
      .order('scheduled_at')

    setBookings((data as Booking[]) ?? [])
    setLoading(false)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const firstDayOfWeek = startOfMonth(currentMonth).getDay()

  const selectedDayBookings = selectedDate
    ? bookings.filter(b => isSameDay(parseISO(b.scheduled_at), selectedDate))
    : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <Link href="/bookings/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> New booking
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar grid */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg text-white/40 hover:bg-white/8 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:bg-white/8 hover:text-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg text-white/40 hover:bg-white/8 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div className="cal-grid mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-white/30 py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="cal-grid gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map(day => {
              const dayBookings = bookings.filter(b => isSameDay(parseISO(b.scheduled_at), day))
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const today = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative aspect-square flex flex-col items-center justify-start p-1.5 rounded-lg text-sm transition-all',
                    !isSameMonth(day, currentMonth) && 'opacity-30',
                    isSelected && 'bg-ink-600/30 border border-ink-500/50',
                    !isSelected && today && 'border border-ink-500/30',
                    !isSelected && !today && 'hover:bg-white/5',
                  )}
                >
                  <span className={cn(
                    'h-6 w-6 flex items-center justify-center rounded-full text-xs font-medium',
                    today && !isSelected && 'bg-ink-600 text-white',
                    isSelected && 'text-ink-300 font-bold',
                    !today && !isSelected && 'text-white/60',
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayBookings.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayBookings.slice(0, 3).map(b => (
                        <div
                          key={b.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            b.status === 'completed' ? 'bg-green-400' :
                            b.status === 'confirmed' ? 'bg-blue-400' : 'bg-yellow-400'
                          )}
                        />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[9px] text-white/30">+{dayBookings.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day detail */}
        <div className="rounded-xl border border-white/8 bg-surface-1">
          <div className="px-5 py-4 border-b border-white/6">
            <h3 className="font-semibold text-white">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a day'}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="divide-y divide-white/6 overflow-y-auto max-h-[500px]">
            {selectedDayBookings.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-white/30">No bookings this day</p>
            )}
            {selectedDayBookings
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map(booking => (
                <Link key={booking.id} href={`/bookings/${booking.id}`} className="block px-5 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{booking.client_name}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{booking.tattoo_description || 'No description'}</p>
                      <p className="text-xs text-white/30 mt-1">
                        {format(parseISO(booking.scheduled_at), 'h:mm a')} · {booking.duration_minutes}min
                      </p>
                    </div>
                    <Badge className={cn('text-xs shrink-0', bookingStatusColor(booking.status))}>
                      {booking.status}
                    </Badge>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
