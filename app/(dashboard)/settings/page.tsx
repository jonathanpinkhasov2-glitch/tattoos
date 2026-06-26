'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Select, SelectItem } from '@/components/ui/select'
import Link from 'next/link'
import type { Studio, Artist } from '@/types'

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Australia/Sydney',
]

export default function SettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [studio, setStudio] = useState<Studio | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('studios')
      .select('*, artists(*)')
      .single() as { data: (Studio & { artists: Artist[] }) | null }

    if (data) {
      setStudio(data)
      setArtist(data.artists?.[0] ?? null)
    }
  }

  async function saveStudio() {
    if (!studio) return
    setLoading(true)
    const { error } = await supabase.from('studios').update({
      name: studio.name,
      timezone: studio.timezone,
      phone: studio.phone,
      address: studio.address,
      website: studio.website,
      instagram: studio.instagram,
    }).eq('id', studio.id)

    if (!error) toast({ title: 'Studio saved', type: 'success' })
    else toast({ title: 'Failed to save', type: 'error' })
    setLoading(false)
  }

  async function saveArtist() {
    if (!artist) return
    setLoading(true)
    const { error } = await supabase.from('artists').update({
      name: artist.name,
      bio: artist.bio,
      hourly_rate: artist.hourly_rate,
      deposit_percentage: artist.deposit_percentage,
      deposit_type: artist.deposit_type,
      deposit_amount: artist.deposit_amount,
      deposit_required: artist.deposit_required,
      instagram: artist.instagram,
    }).eq('id', artist.id)

    if (!error) toast({ title: 'Profile saved', type: 'success' })
    else toast({ title: 'Failed to save', type: 'error' })
    setLoading(false)
  }

  if (!studio || !artist) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 rounded-full border-2 border-ink-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <Link href="/settings/billing">
          <Button variant="outline" size="sm">Billing & plan →</Button>
        </Link>
      </div>

      {/* Booking link */}
      <div className="rounded-xl border border-ink-500/30 bg-ink-500/8 p-5">
        <p className="text-sm text-white/60 mb-2">Your booking page</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-ink-300 bg-black/20 rounded-lg px-3 py-2 font-mono truncate">
            {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/book/{artist.slug}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/book/${artist.slug}`)
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Studio settings */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
        <h2 className="font-semibold text-white">Studio</h2>
        <Input
          label="Studio name"
          value={studio.name}
          onChange={e => setStudio(s => s ? { ...s, name: e.target.value } : s)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            value={studio.phone ?? ''}
            onChange={e => setStudio(s => s ? { ...s, phone: e.target.value } : s)}
          />
          <Input
            label="Website"
            type="url"
            value={studio.website ?? ''}
            onChange={e => setStudio(s => s ? { ...s, website: e.target.value } : s)}
          />
        </div>
        <Input
          label="Address"
          value={studio.address ?? ''}
          onChange={e => setStudio(s => s ? { ...s, address: e.target.value } : s)}
        />
        <Input
          label="Instagram handle"
          placeholder="@yourstudio"
          value={studio.instagram ?? ''}
          onChange={e => setStudio(s => s ? { ...s, instagram: e.target.value } : s)}
        />
        <Select
          label="Timezone"
          value={studio.timezone ?? 'America/New_York'}
          onValueChange={v => setStudio(s => s ? { ...s, timezone: v } : s)}
        >
          {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
        </Select>
        <Button onClick={saveStudio} loading={loading}>Save studio</Button>
      </div>

      {/* Artist profile */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
        <h2 className="font-semibold text-white">Artist profile</h2>
        <Input
          label="Display name"
          value={artist.name}
          onChange={e => setArtist(a => a ? { ...a, name: e.target.value } : a)}
        />
        <Textarea
          label="Bio"
          placeholder="Tell clients about your style and experience..."
          value={artist.bio ?? ''}
          onChange={e => setArtist(a => a ? { ...a, bio: e.target.value } : a)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hourly rate ($)"
            type="number"
            min="0"
            value={artist.hourly_rate ?? ''}
            onChange={e => setArtist(a => a ? { ...a, hourly_rate: parseFloat(e.target.value) } : a)}
          />
          <Select
            label="Deposit type"
            value={artist.deposit_type ?? 'flat'}
            onValueChange={v => setArtist(a => a ? { ...a, deposit_type: v } : a)}
          >
            <SelectItem value="flat">Flat amount ($)</SelectItem>
            <SelectItem value="percent">Percentage (%)</SelectItem>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(artist.deposit_type ?? 'flat') === 'flat' ? (
            <Input
              label="Deposit amount ($)"
              type="number"
              min="0"
              placeholder="50"
              value={artist.deposit_amount ?? ''}
              onChange={e => setArtist(a => a ? { ...a, deposit_amount: parseFloat(e.target.value) } : a)}
            />
          ) : (
            <Input
              label="Deposit %"
              type="number"
              min="0"
              max="100"
              placeholder="30"
              value={artist.deposit_percentage ?? ''}
              onChange={e => setArtist(a => a ? { ...a, deposit_percentage: parseInt(e.target.value) } : a)}
            />
          )}
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer pt-6">
            <input
              type="checkbox"
              className="rounded accent-ink-500"
              checked={artist.deposit_required ?? true}
              onChange={e => setArtist(a => a ? { ...a, deposit_required: e.target.checked } : a)}
            />
            Deposit required
          </label>
        </div>
        <Input
          label="Instagram handle"
          placeholder="@yourhandle"
          value={artist.instagram ?? ''}
          onChange={e => setArtist(a => a ? { ...a, instagram: e.target.value } : a)}
        />
        <Button onClick={saveArtist} loading={loading}>Save profile</Button>
      </div>
    </div>
  )
}
