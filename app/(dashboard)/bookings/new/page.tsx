'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PLACEMENTS = ['Upper arm','Lower arm','Forearm','Wrist','Hand','Shoulder','Chest','Rib','Back','Spine','Hip','Thigh','Calf','Ankle','Foot','Neck','Behind ear','Other']
const SIZES = ['Tiny (< 2 in)','Small (2–4 in)','Medium (4–6 in)','Large (6–10 in)','XL (10+ in)','Full sleeve','Half sleeve']
const STYLES = ['Traditional','Neo-traditional','Realism','Watercolor','Blackwork','Geometric','Tribal','Japanese','Minimalist','Illustrative','Fine line','Other']

export default function NewBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [artistId, setArtistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    scheduled_at: '',
    duration_minutes: '120',
    tattoo_description: '',
    placement: '',
    size: '',
    style: '',
    is_color: false,
    is_cover_up: false,
    session_price: '',
    deposit_amount: '',
    notes: '',
    status: 'confirmed',
  })

  const [studioId, setStudioId] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('studios').select('id, artists(id)').single().then(({ data }: { data: { id: string; artists: { id: string }[] } | null }) => {
      const studio = data
      if (studio?.id) setStudioId(studio.id)
      const id = studio?.artists?.[0]?.id
      if (id) setArtistId(id)
    })
  }, [])

  const set = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artistId || !studioId) return
    setLoading(true)

    const payload = {
      artist_id: artistId,
      studio_id: studioId,
      client_name: form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone || null,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      duration_minutes: parseInt(form.duration_minutes),
      tattoo_description: form.tattoo_description || null,
      placement: form.placement || null,
      size: form.size || null,
      style: form.style || null,
      is_color: form.is_color,
      is_cover_up: form.is_cover_up,
      session_price: form.session_price ? parseFloat(form.session_price) : null,
      deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
      deposit_paid: false,
      notes: form.notes || null,
      status: form.status,
    }

    const { data, error } = await supabase.from('bookings').insert(payload).select('id').single()

    if (error) {
      toast({ title: 'Failed to create booking', type: 'error' })
    } else {
      toast({ title: 'Booking created!', type: 'success' })
      router.push(`/bookings/${data.id}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/bookings">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">New booking</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Client info</h2>
          <Input label="Name *" value={form.client_name} onChange={e => set('client_name', e.target.value)} required />
          <Input label="Email *" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} required />
          <Input label="Phone" type="tel" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} />
        </div>

        {/* Session */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Session details</h2>
          <Input
            label="Date & time *"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={e => set('scheduled_at', e.target.value)}
            required
          />
          <Select label="Duration" value={form.duration_minutes} onValueChange={v => set('duration_minutes', v)}>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
            <SelectItem value="180">3 hours</SelectItem>
            <SelectItem value="240">4 hours</SelectItem>
            <SelectItem value="300">5 hours</SelectItem>
            <SelectItem value="360">6 hours (full day)</SelectItem>
          </Select>
          <Select label="Status" value={form.status} onValueChange={v => set('status', v)}>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
          </Select>
        </div>

        {/* Tattoo */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Tattoo details</h2>
          <Textarea
            label="Description"
            placeholder="Describe the tattoo concept..."
            value={form.tattoo_description}
            onChange={e => set('tattoo_description', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Placement" value={form.placement} onValueChange={v => set('placement', v)} placeholder="Select...">
              {PLACEMENTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </Select>
            <Select label="Size" value={form.size} onValueChange={v => set('size', v)} placeholder="Select...">
              {SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </Select>
          </div>
          <Select label="Style" value={form.style} onValueChange={v => set('style', v)} placeholder="Select...">
            {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </Select>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 accent-ink-500"
                checked={form.is_color}
                onChange={e => set('is_color', e.target.checked)}
              />
              Color work
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 accent-ink-500"
                checked={form.is_cover_up}
                onChange={e => set('is_cover_up', e.target.checked)}
              />
              Cover-up
            </label>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Payment</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Session price ($)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.session_price}
              onChange={e => set('session_price', e.target.value)}
            />
            <Input
              label="Deposit amount ($)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.deposit_amount}
              onChange={e => set('deposit_amount', e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
          <h2 className="font-semibold text-white">Artist notes</h2>
          <Textarea
            label="Private notes"
            placeholder="Internal notes only visible to you..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Link href="/bookings" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} className="flex-1">
            Create booking
          </Button>
        </div>
      </form>
    </div>
  )
}
