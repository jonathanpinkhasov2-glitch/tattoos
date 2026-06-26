import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()

  // Get artist record
  const { data: artist } = await serviceClient
    .from('artists')
    .select('id, stripe_account_id, email')
    .eq('user_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

  // Reuse existing account if already started
  let accountId = artist.stripe_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: artist.email ?? user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: { schedule: { interval: 'weekly', weekly_anchor: 'friday' } },
      },
    })
    accountId = account.id

    // Save account ID
    await serviceClient
      .from('artists')
      .update({ stripe_account_id: accountId })
      .eq('id', artist.id)
  }

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect`,
    return_url: `${appUrl}/api/stripe/connect/callback?account=${accountId}`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: link.url })
}
