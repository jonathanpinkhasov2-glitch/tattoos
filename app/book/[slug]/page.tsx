import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BookingForm } from './booking-form'
import type { Artist, Studio } from '@/types'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServiceClient()
  const { data: artist } = await supabase
    .from('artists')
    .select('name, bio, studios(name)')
    .eq('slug', params.slug)
    .single() as { data: (Artist & { studios: { name: string } }) | null }

  if (!artist) return { title: 'Book a tattoo' }
  return {
    title: `Book with ${artist.name}`,
    description: artist.bio || `Book a tattoo session with ${artist.name}`,
  }
}

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const supabase = createServiceClient()

  const { data: artist } = await supabase
    .from('artists')
    .select('*, studios(name, id, subscription_status)')
    .eq('slug', params.slug)
    .single() as { data: (Artist & { studios: { name: string; id: string; subscription_status: string } }) | null }

  if (!artist) notFound()

  // Check if studio subscription is active
  const isActive = ['active', 'trialing'].includes(artist.studios?.subscription_status ?? '')
  if (!isActive) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Booking unavailable</h1>
          <p className="text-white/50 text-sm">This artist's booking page is currently offline.</p>
        </div>
      </div>
    )
  }

  // Fetch availability
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('artist_id', artist.id)

  // Fetch blocked dates (next 3 months)
  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('artist_id', artist.id)
    .gte('date', new Date().toISOString())

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-white/8 bg-surface-1/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-ink-500/20 flex items-center justify-center text-ink-300 font-bold text-lg">
            {artist.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-semibold">{artist.name}</p>
            <p className="text-white/40 text-xs">{artist.studios?.name}</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Book a session</h1>
        {artist.bio && <p className="text-white/60">{artist.bio}</p>}
        <div className="mt-4 flex gap-4 text-sm text-white/50">
          {artist.hourly_rate && (
            <span>From ${artist.hourly_rate}/hr</span>
          )}
          {(artist.styles ?? artist.specialties)?.length > 0 && (
            <span>Styles: {(artist.styles ?? artist.specialties ?? []).join(', ')}</span>
          )}
        </div>
      </div>

      {/* Booking form */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <BookingForm
          artist={artist}
          availability={availability ?? []}
          blockedDates={blockedDates ?? []}
        />
      </div>
    </div>
  )
}
