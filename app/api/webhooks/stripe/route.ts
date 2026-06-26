import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const studioId = sub.metadata?.studio_id
      if (!studioId) break

      const priceId = sub.items.data[0]?.price?.id
      let plan = 'solo'
      if (priceId === process.env.STRIPE_STUDIO_PRICE_ID) plan = 'studio'
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'

      await supabase.from('studios').update({
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        subscription_plan: plan,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      }).eq('id', studioId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const studioId = sub.metadata?.studio_id
      if (!studioId) break

      await supabase.from('studios').update({
        subscription_status: 'canceled',
      }).eq('id', studioId)
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      // Handle deposit payments for bookings
      if (session.metadata?.booking_id) {
        const amount = session.amount_total ?? 0
        await supabase.from('bookings').update({
          deposit_paid: true,
          total_paid: amount,
          status: 'confirmed',
        }).eq('id', session.metadata.booking_id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const studioId = (invoice as { metadata?: { studio_id?: string } }).metadata?.studio_id
      if (studioId) {
        await supabase.from('studios').update({
          subscription_status: 'past_due',
        }).eq('id', studioId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
