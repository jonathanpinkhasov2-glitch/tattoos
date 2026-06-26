'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Client } from '@/types'

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<(Client & { booking_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: studio } = await supabase.from('studios').select('id').single()
    const studioId = (studio as { id: string } | null)?.id
    if (!studioId) { setLoading(false); return }

    const { data } = await supabase
      .from('clients')
      .select('*, bookings(count)')
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })

    setClients((data ?? []).map((c: Client & { bookings: { count: number }[] }) => ({
      ...c,
      name: [c.first_name, c.last_name].filter(Boolean).join(' '),
      booking_count: c.bookings?.[0]?.count ?? 0,
    })))
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    search === '' ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <span className="text-sm text-white/40">{clients.length} total</span>
      </div>

      <Input
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        prefix={<Search className="h-4 w-4" />}
      />

      <div className="rounded-xl border border-white/8 bg-surface-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-ink-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No clients yet</p>
            <p className="text-white/25 text-xs mt-1">Clients appear automatically when they book.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {filtered.map(client => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group"
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-ink-500/20 flex items-center justify-center text-ink-300 font-semibold shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{client.name}</p>
                    {client.is_blocked && <Badge variant="danger" className="text-xs">Blocked</Badge>}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{client.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs text-white/30">
                  <div className="text-center">
                    <p className="font-medium text-white/60">{client.booking_count}</p>
                    <p>sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white/60">{formatDate(client.created_at)}</p>
                    <p>joined</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
