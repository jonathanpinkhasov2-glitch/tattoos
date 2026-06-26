'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Check, X, CheckCircle, Ban, FileText, Copy } from 'lucide-react'
import type { Booking } from '@/types'

interface Props { booking: Booking }

export function BookingActions({ booking }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [showCancel, setShowCancel] = useState(false)
  const [showConsentLink, setShowConsentLink] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const sendConsentForm = async () => {
    setLoading('consent')
    const res = await fetch('/api/consent-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: booking.id }),
    })
    if (res.ok) {
      const { url } = await res.json()
      setShowConsentLink(url)
    } else {
      toast({ title: 'Failed to generate consent form link', type: 'error' })
    }
    setLoading(null)
  }

  const updateStatus = async (status: string) => {
    setLoading(status)
    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast({ title: `Booking ${status}`, type: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Failed to update', type: 'error' })
    }
    setLoading(null)
    setShowCancel(false)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {booking.status === 'pending' && (
        <Button
          size="sm"
          variant="success"
          loading={loading === 'confirmed'}
          onClick={() => updateStatus('confirmed')}
        >
          <Check className="h-4 w-4 mr-1" /> Confirm
        </Button>
      )}
      {booking.status === 'confirmed' && (
        <Button
          size="sm"
          variant="success"
          loading={loading === 'completed'}
          onClick={() => updateStatus('completed')}
        >
          <CheckCircle className="h-4 w-4 mr-1" /> Mark complete
        </Button>
      )}
      {['pending', 'confirmed'].includes(booking.status) && (
        <>
          <Button
            size="sm"
            variant="secondary"
            loading={loading === 'no_show'}
            onClick={() => updateStatus('no_show')}
          >
            No show
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowCancel(true)}
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </>
      )}

      {/* Send consent form button */}
      <Button
        size="sm"
        variant="outline"
        loading={loading === 'consent'}
        onClick={sendConsentForm}
      >
        <FileText className="h-4 w-4 mr-1" /> Send consent form
      </Button>

      {/* Cancel modal */}
      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancel booking"
        description="This will cancel the booking and notify the client. The deposit policy applies."
        size="sm"
      >
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => setShowCancel(false)}>
            Keep booking
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={loading === 'cancelled'}
            onClick={() => updateStatus('cancelled')}
          >
            <Ban className="h-4 w-4 mr-1" /> Cancel it
          </Button>
        </div>
      </Modal>

      {/* Consent link modal */}
      <Modal
        open={!!showConsentLink}
        onClose={() => setShowConsentLink(null)}
        title="Consent form link"
        description="Share this link with your client so they can complete the consent form before their session."
        size="sm"
      >
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-black/20 border border-white/10 px-3 py-2">
            <code className="flex-1 text-xs text-ink-300 truncate font-mono">{showConsentLink}</code>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(showConsentLink!)
                toast({ title: 'Link copied!', type: 'success' })
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-white/40">
            Send this via text or email. The client can sign from any device — no account needed.
          </p>
          <Button className="w-full" onClick={() => setShowConsentLink(null)}>Done</Button>
        </div>
      </Modal>
    </div>
  )
}
