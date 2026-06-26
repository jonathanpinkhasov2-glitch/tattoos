import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const { booking_id } = await req.json()
  if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 })

  const serviceClient = createServiceClient()

  // Verify booking exists
  const { data: booking } = await serviceClient
    .from('bookings')
    .select('id')
    .eq('id', booking_id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const token = randomUUID()

  const { data, error } = await serviceClient
    .from('consent_forms')
    .upsert({ booking_id, token, status: 'pending' }, { onConflict: 'booking_id' })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/consent/${data.token}`
  return NextResponse.json({ url })
}
