'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Artist, Availability, BlockedDate } from '@/types'

const PLACEMENTS = ['Upper arm','Lower arm','Forearm','Wrist','Hand','Shoulder','Chest','Rib','Back','Spine','Hip','Thigh','Calf','Ankle','Foot','Neck','Behind ear','Other']
const SIZES = ['Tiny (< 2 in)','Small (2–4 in)','Medium (4–6 in)','Large (6–10 in)','XL (10+ in)','Full sleeve','Half sleeve']
const SIZE_TO_DB: Record<string, string> = {
  'Tiny (< 2 in)': 'small',
  'Small (2–4 in)': 'small',
  'Medium (4–6 in)': 'medium',
  'Large (6–10 in)': 'large',
  'XL (10+ in)': 'large',
  'Full sleeve': 'full_sleeve',
  'Half sleeve': 'full_sleeve',
}
const STYLES = ['Traditional','Neo-traditional','Realism','Watercolor','Blackwork','Geometric','Tribal','Japanese','Minimalist','Illustrative','Fine line','Other']

interface Props {
  artist: Artist & { studios: { name: string; id: string } }
  availability: Availability[]
  blockedDates: BlockedDate[]
}

export function BookingForm({ artist, availability, blockedDates }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1|2|3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    // Step 1 — tattoo details
    tattoo_description: '',
    placement: '',
    size: '',
    style: '',
    is_color: false,
    is_cover_up: false,
    reference_url: '',
    // Step 2 — date/time
    preferred_date: '',
    preferred_time: '',
    // Step 3 — client info
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
  })

  const set = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }))

  const submit = async () => {
    setLoading(true)
    setError(null)

    const scheduledAt = new Date(`${form.preferred_date}T${form.preferred_time || '10:00'}`)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_id: artist.id,
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone || null,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 120,
        tattoo_description: form.tattoo_description,
        placement: form.placement,
        size: SIZE_TO_DB[form.size] || 'other',
        style: form.style,
        is_color: form.is_color,
        is_cover_up: form.is_cover_up,
        notes: form.notes,
        status: 'pending',
        deposit_amount: artist.deposit_percentage
          ? Math.round((artist.hourly_rate ?? 150) * 2 * (artist.deposit_percentage / 100))
          : 50, // $50 default deposit
      }),
    })

    if (res.ok) {
      const { id } = await res.json()
      router.push(`/book/${artist.slug}/success?booking=${id}`)
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: 'Failed to submit' }))
      setError(msg ?? 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2 pt-2">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              s < step ? 'bg-ink-600 text-white' :
              s === step ? 'bg-ink-500 text-white' :
              'bg-white/8 text-white/30'
            }`}>
              {s < step ? '✓' : s}
            </div>
            <span className={`text-xs ${s === step ? 'text-white/70' : 'text-white/30'}`}>
              {s === 1 ? 'Tattoo' : s === 2 ? 'Date' : 'Your info'}
            </span>
            {s < 3 && <div className="h-px w-8 bg-white/10 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold text-white text-lg">Tell us about your tattoo</h2>
          <Textarea
            label="Describe your idea *"
            placeholder="What do you want to get tattooed? Any references, style preferences, meaning..."
            value={form.tattoo_description}
            onChange={e => set('tattoo_description', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Placement" value={form.placement} onValueChange={v => set('placement', v)} placeholder="Where on body?">
              {PLACEMENTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </Select>
            <Select label="Size" value={form.size} onValueChange={v => set('size', v)} placeholder="Estimated size?">
              {SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </Select>
          </div>
          <Select label="Style" value={form.style} onValueChange={v => set('style', v)} placeholder="Preferred style?">
            {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </Select>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" className="rounded accent-ink-500" checked={form.is_color} onChange={e => set('is_color', e.target.checked)} />
              Color work
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" className="rounded accent-ink-500" checked={form.is_cover_up} onChange={e => set('is_cover_up', e.target.checked)} />
              Cover-up
            </label>
          </div>
          <Button className="w-full mt-2" onClick={() => setStep(2)} disabled={!form.tattoo_description}>
            Next: Choose a date →
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold text-white text-lg">Pick a date & time</h2>
          <p className="text-sm text-white/50">Choose your preferred session date. The artist will confirm availability.</p>
          <Input
            label="Preferred date *"
            type="date"
            value={form.preferred_date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => set('preferred_date', e.target.value)}
            required
          />
          <Select label="Preferred time" value={form.preferred_time} onValueChange={v => set('preferred_time', v)} placeholder="Select a time">
            {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => (
              <SelectItem key={t} value={t}>{
                (() => {
                  const h = parseInt(t.split(':')[0])
                  return `${h > 12 ? h-12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`
                })()
              }</SelectItem>
            ))}
          </Select>
          <div className="p-3 rounded-lg bg-ink-500/10 border border-ink-500/20 text-sm text-white/60">
            💡 This is a request — your artist will confirm the booking and send a deposit link.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
            <Button className="flex-1" onClick={() => setStep(3)} disabled={!form.preferred_date}>
              Next: Your info →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold text-white text-lg">Your contact info</h2>
          <Input label="Full name *" value={form.client_name} onChange={e => set('client_name', e.target.value)} required />
          <Input label="Email *" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} required />
          <Input label="Phone (optional)" type="tel" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} />
          <Textarea label="Anything else?" placeholder="Any other details, allergies, or questions..." value={form.notes} onChange={e => set('notes', e.target.value)} />

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
            <Button
              className="flex-1"
              loading={loading}
              disabled={!form.client_name || !form.client_email}
              onClick={submit}
            >
              Submit request 🎉
            </Button>
          </div>

          <p className="text-xs text-white/30 text-center">
            By submitting you agree to our terms. A deposit will be required to confirm your session.
          </p>
        </div>
      )}
    </div>
  )
}
