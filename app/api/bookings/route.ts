import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewBookingNotification, sendBookingConfirmationToClient } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    artist_id, client_name, client_email, client_phone,
    scheduled_at, duration_minutes, tattoo_description,
    placement, size, style, is_color, is_cover_up,
    notes, status, deposit_amount,
  } = body

  if (!artist_id || !client_name || !client_email || !scheduled_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Sanitize size to valid DB enum values
  const VALID_SIZES = ['small', 'medium', 'large', 'full_sleeve', 'other']
  const SIZE_MAP: Record<string, string> = {
    'tiny': 'small', 'small': 'small', 'medium': 'medium',
    'large': 'large', 'xl': 'large', 'full': 'full_sleeve', 'half': 'full_sleeve',
  }
  const normalizedSize = size
    ? (VALID_SIZES.includes(size)
        ? size
        : SIZE_MAP[Object.keys(SIZE_MAP).find(k => size.toLowerCase().includes(k)) ?? ''] ?? 'other')
    : null

  const supabase = createServiceClient()

  // Check if artist exists and studio is active
  const { data: artist } = await supabase
    .from('artists')
    .select('id, studio_id, studios(id, subscription_status)')
    .eq('id', artist_id)
    .single() as { data: { id: string; studio_id: string; studios: { id: string; subscription_status: string } } | null }

  if (!artist) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
  }

  const subStatus = artist.studios?.subscription_status
  if (!['active', 'trialing'].includes(subStatus)) {
    return NextResponse.json({ error: 'Booking unavailable' }, { status: 403 })
  }

  const studioId = artist.studio_id

  let clientId: string | null = null
  if (studioId && client_email) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('studio_id', studioId)
      .eq('email', client_email)
      .single()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const nameParts = client_name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          studio_id: studioId,
          artist_id,
          first_name: firstName,
          last_name: lastName,
          email: client_email,
          phone: client_phone,
        })
        .select('id')
        .single()
      clientId = newClient?.id ?? null
    }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      artist_id,
      studio_id: studioId,
      client_id: clientId,
      client_name,
      client_email,
      client_phone: client_phone || null,
      scheduled_at,
      duration_minutes: duration_minutes ?? 120,
      tattoo_description: tattoo_description || null,
      placement: placement || null,
      size: normalizedSize,
      style: style || null,
      is_color: is_color ?? false,
      is_cover_up: is_cover_up ?? false,
      notes: notes || null,
      status: status ?? 'pending',
      deposit_amount: deposit_amount ?? 50, // stored in dollars (numeric(10,2))
      deposit_paid: false,
      total_paid: 0,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send email notifications (fire-and-forget — don't block response)
  const { data: fullArtist } = await supabase
    .from('artists')
    .select('name, email')
    .eq('id', artist_id)
    .single()

  if (fullArtist?.email) {
    sendNewBookingNotification({
      artistEmail: fullArtist.email,
      artistName: fullArtist.name,
      clientName: client_name,
      clientEmail: client_email,
      clientPhone: client_phone,
      scheduledAt: scheduled_at,
      tattooDescription: tattoo_description,
      placement,
      size: normalizedSize,
      depositAmount: deposit_amount ?? 50,
      bookingId: booking.id,
    }).catch(() => {}) // silent fail — don't break booking if email fails
  }

  sendBookingConfirmationToClient({
    clientEmail: client_email,
    clientName: client_name,
    artistName: fullArtist?.name ?? 'your artist',
    scheduledAt: scheduled_at,
    depositAmount: deposit_amount ?? 50,
  }).catch(() => {})

  return NextResponse.json({ id: booking.id }, { status: 201 })
}
