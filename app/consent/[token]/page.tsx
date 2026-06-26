import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ConsentFormClient } from './consent-form-client'
import { formatDateTime } from '@/lib/utils'

export default async function ConsentFormPage({ params }: { params: { token: string } }) {
  const supabase = createServiceClient()

  const { data: form } = await supabase
    .from('consent_forms')
    .select('*, bookings(client_name, scheduled_at, tattoo_description, placement, artists(name, studios(name)))')
    .eq('token', params.token)
    .single()

  if (!form) notFound()

  if (form.status === 'signed') {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-white mb-2">Already signed</h1>
          <p className="text-white/50 text-sm">This consent form has already been completed. See you at your session!</p>
        </div>
      </div>
    )
  }

  const booking = Array.isArray(form.bookings) ? form.bookings[0] : form.bookings
  const artist = Array.isArray(booking?.artists) ? booking.artists[0] : booking?.artists
  const studio = Array.isArray(artist?.studios) ? artist.studios[0] : artist?.studios

  return (
    <div className="min-h-screen bg-surface-0 pb-16">
      {/* Header */}
      <header className="border-b border-white/8 bg-surface-1/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-white font-semibold">{studio?.name ?? 'TattooOS'}</p>
          <p className="text-white/40 text-xs">Tattoo Consent Form</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {/* Session info */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-5">
          <h2 className="text-white font-semibold mb-3">Your session</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Client', value: booking?.client_name },
              { label: 'Artist', value: artist?.name },
              { label: 'Date', value: booking?.scheduled_at ? formatDateTime(booking.scheduled_at) : '—' },
              { label: 'Design', value: booking?.tattoo_description ?? '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <ConsentFormClient formId={form.id} token={params.token} clientName={booking?.client_name ?? ''} />
      </div>
    </div>
  )
}
