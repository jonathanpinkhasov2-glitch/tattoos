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

  // Return existing consent form if already created
  const { data: existing } = await serviceClient
    .from('consent_forms')
    .select('token')
    .eq('booking_id', booking_id)
    .single()

  if (existing) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/consent/${existing.token}`
    return NextResponse.json({ url })
  }

  // Create new consent form
  const token = randomUUID()
  const { data, error } = await serviceClient
    .from('consent_forms')
    .insert({ booking_id, token, status: 'pending' })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/consent/${data.token}`
  return NextResponse.json({ url })
}
