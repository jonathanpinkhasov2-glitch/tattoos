import { NextRequest, NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase/server'
import { createCheckoutSession, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = createActionClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: studio } = await supabase
    .from('studios')
    .select('id, stripe_customer_id')
    .eq('owner_id', session.user.id)
    .single()

  if (!studio) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const checkoutUrl = await createCheckoutSession({
    customerId: studio.stripe_customer_id ?? undefined,
    priceId: PLANS[plan as keyof typeof PLANS].priceId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    customerEmail: session.user.email,
    metadata: { studio_id: studio.id, user_id: session.user.id },
  })

  return NextResponse.json({ url: checkoutUrl })
}
