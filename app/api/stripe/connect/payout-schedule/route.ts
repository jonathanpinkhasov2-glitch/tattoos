import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

// PATCH /api/stripe/connect/payout-schedule
// Body: { interval: 'daily' | 'weekly' | 'monthly' }
export async function PATCH(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interval } = await req.json()
  if (!['daily', 'weekly', 'monthly'].includes(interval)) {
    return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  const { data: artist } = await serviceClient
    .from('artists')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .single()

  if (!artist?.stripe_account_id) {
    return NextResponse.json({ error: 'No connected bank account' }, { status: 404 })
  }

  const schedule: Record<string, unknown> = { interval }
  if (interval === 'weekly') schedule.weekly_anchor = 'friday'
  if (interval === 'monthly') schedule.monthly_anchor = 1

  await stripe.accounts.update(artist.stripe_account_id, {
    settings: { payouts: { schedule } },
  })

  return NextResponse.json({ success: true })
}
