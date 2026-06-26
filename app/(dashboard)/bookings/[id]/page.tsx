import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookingActions } from './booking-actions'
import { formatDateTime, formatMoney, bookingStatusColor, consentStatusColor, cn } from '@/lib/utils'
import { DollarSign, Phone, Mail, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Booking, ConsentForm } from '@/types'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, artists(name, slug), clients(*), consent_forms(*)')
    .eq('id', params.id)
    .single() as { data: (Booking & { artists: { name: string; slug: string }; consent_forms: ConsentForm[] }) | null }

  if (!booking) notFound()

  const consentForm = booking.consent_forms?.[0]
  const depositStatus = booking.deposit_paid ? 'paid' : 'pending'

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{booking.client_name}</h1>
          <p className="text-white/50 text-sm mt-0.5">{formatDateTime(booking.scheduled_at)}</p>
        </div>
        <Badge className={cn('capitalize', bookingStatusColor(booking.status))}>
          {booking.status}
        </Badge>
      </div>

      <BookingActions booking={booking} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client info */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Client</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-white/30 shrink-0" />
              <span className="text-white/70">{booking.client_email}</span>
            </div>
            {booking.client_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-white/30 shrink-0" />
                <span className="text-white/70">{booking.client_phone}</span>
              </div>
            )}
            {booking.client_id && (
              <Link href={`/clients/${booking.client_id}`} className="text-sm text-ink-400 hover:text-ink-300 flex items-center gap-1">
                View full client profile →
              </Link>
            )}
          </div>
        </div>

        {/* Session info */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Session</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Date & time</span>
              <span className="text-white">{formatDateTime(booking.scheduled_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Duration</span>
              <span className="text-white">{booking.duration_minutes} min</span>
            </div>
            {booking.session_price && (
              <div className="flex justify-between">
                <span className="text-white/50">Session price</span>
                <span className="text-white">{formatMoney(booking.session_price)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/50">Artist</span>
              <span className="text-white">{booking.artists?.name}</span>
            </div>
          </div>
        </div>

        {/* Tattoo details */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Tattoo details</h2>
          <div className="space-y-2 text-sm">
            {booking.tattoo_description && (
              <p className="text-white/70">{booking.tattoo_description}</p>
            )}
            <div className="flex gap-2 flex-wrap mt-3">
              {booking.placement && <Badge variant="neutral">{booking.placement}</Badge>}
              {booking.size && <Badge variant="neutral">{booking.size}</Badge>}
              {booking.style && <Badge variant="neutral">{booking.style}</Badge>}
              {booking.is_color && <Badge variant="info">Color</Badge>}
              {booking.is_cover_up && <Badge variant="warning">Cover-up</Badge>}
            </div>
            {booking.notes && (
              <div className="mt-3 p-3 rounded-lg bg-white/4 border border-white/8">
                <p className="text-xs text-white/40 mb-1">Artist notes</p>
                <p className="text-sm text-white/70">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Payment</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/4 border border-white/8">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-white/30" />
                <span className="text-sm text-white/70">Deposit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{formatMoney(booking.deposit_amount)}</span>
                {booking.deposit_paid
                  ? <CheckCircle className="h-4 w-4 text-green-400" />
                  : <AlertCircle className="h-4 w-4 text-yellow-400" />
                }
              </div>
            </div>
            {booking.total_paid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Total paid</span>
                <span className="text-white font-medium">{formatMoney(booking.total_paid)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consent form */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Consent form</h2>
          {consentForm ? (
            <Badge className={consentStatusColor(consentForm.status)}>
              {consentForm.status}
            </Badge>
          ) : (
            <Badge variant="warning">Not sent</Badge>
          )}
        </div>
        {consentForm?.status === 'signed' ? (
          <div className="space-y-2">
            <p className="text-sm text-white/60">
              Signed by <span className="text-white">{consentForm.full_name}</span> on{' '}
              {consentForm.signed_at ? new Date(consentForm.signed_at).toLocaleDateString() : '—'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {[
                { label: 'Pregnant', value: consentForm.is_pregnant },
                { label: 'Blood disorder', value: consentForm.has_blood_disorder },
                { label: 'Skin condition', value: consentForm.has_skin_condition },
                { label: 'Allergies', value: consentForm.has_allergies },
                { label: 'Blood thinners', value: consentForm.on_blood_thinners },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2 text-white/50">
                  {value
                    ? <AlertCircle className="h-3 w-3 text-yellow-400" />
                    : <CheckCircle className="h-3 w-3 text-green-400/40" />
                  }
                  {label}: <span className={value ? 'text-yellow-400' : 'text-white/30'}>{value ? 'YES' : 'No'}</span>
                </div>
              ))}
            </div>
            {consentForm.allergy_details && (
              <p className="text-xs text-yellow-300 bg-yellow-400/10 rounded p-2 mt-2">
                ⚠ Allergies: {consentForm.allergy_details}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">
              {consentForm ? 'Client hasn\'t signed yet' : 'No consent form sent'}
            </p>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              {consentForm ? 'Resend link' : 'Send consent form'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
