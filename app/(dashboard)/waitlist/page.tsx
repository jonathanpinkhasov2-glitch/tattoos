'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Clock, CheckCircle, XCircle, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { WaitlistEntry } from '@/types'

const STATUS_COLORS = {
  waiting: 'bg-yellow-400/15 text-yellow-300',
  contacted: 'bg-blue-400/15 text-blue-300',
  booked: 'bg-green-400/15 text-green-300',
  removed: 'bg-white/10 text-white/40',
}

export default function WaitlistPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [artistId, setArtistId] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('studios').select('artists(id)').single().then(({ data }) => {
      const id = (data as { artists: { id: string }[] } | null)?.artists?.[0]?.id
      if (id) { setArtistId(id); loadEntries(id) }
      else setLoading(false)
    })
  }, [])

  async function loadEntries(id: string) {
    const { data } = await supabase
      .from('waitlist')
      .select('*')
      .eq('artist_id', id)
      .neq('status', 'removed')
      .order('position', { ascending: true })

    setEntries((data ?? []) as WaitlistEntry[])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: WaitlistEntry['status']) => {
    const { error } = await supabase.from('waitlist').update({ status }).eq('id', id)
    if (!error) {
      setEntries(e => e.map(en => en.id === id ? { ...en, status } : en))
      toast({ title: 'Waitlist updated', type: 'success' })
    }
  }

  const waitingCount = entries.filter(e => e.status === 'waiting').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Waitlist</h1>
          <p className="text-white/40 text-sm mt-1">{waitingCount} clients waiting for availability</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-surface-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-ink-500 border-t-transparent animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Your waitlist is empty</p>
            <p className="text-white/25 text-xs mt-1">Clients can join the waitlist from your booking page.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="flex items-center gap-4 px-6 py-4">
                {/* Position */}
                <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-white/30 shrink-0">
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{entry.client_name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{entry.client_email}</p>
                  {entry.style_preference && (
                    <p className="text-xs text-white/30 mt-0.5">Style: {entry.style_preference}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-white/30 shrink-0">
                  <span>Joined {formatDate(entry.created_at)}</span>
                  {entry.notes && <span className="text-ink-400 max-w-[140px] truncate">{entry.notes}</span>}
                </div>

                {/* Status badge */}
                <Badge className={STATUS_COLORS[entry.status]}>{entry.status}</Badge>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  {entry.status === 'waiting' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => updateStatus(entry.id, 'contacted')}
                    >
                      Mark contacted
                    </Button>
                  )}
                  {entry.status === 'contacted' && (
                    <Button
                      size="sm"
                      variant="success"
                      className="text-xs"
                      onClick={() => updateStatus(entry.id, 'booked')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Booked
                    </Button>
                  )}
                  {entry.status !== 'removed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white/20 hover:text-red-400 text-xs"
                      onClick={() => updateStatus(entry.id, 'removed')}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
