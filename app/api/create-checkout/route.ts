import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createCheckoutSession, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: studio } = await supabase
    .from('studios')
    .select('id, stripe_customer_id')
    .eq('owner_id', user.id)
    .single()

  if (!studio) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  // Pro is per-seat with a 5-seat minimum so it can't be gamed as a cheap solo plan
  const quantity = plan === 'pro' ? 5 : 1

  const checkoutUrl = await createCheckoutSession({
    customerId: studio.stripe_customer_id ?? undefined,
    priceId: PLANS[plan as keyof typeof PLANS].priceId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    customerEmail: user.email,
    metadata: { studio_id: studio.id, user_id: user.id },
    quantity,
  })

  return NextResponse.json({ url: checkoutUrl })
}
