import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: studio } = await supabase
    .from('studios')
    .select('stripe_customer_id')
    .eq('owner_id', session.user.id)
    .single()

  if (!studio?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const url = await createBillingPortalSession(
    studio.stripe_customer_id,
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
  )

  return NextResponse.json({ url })
}
