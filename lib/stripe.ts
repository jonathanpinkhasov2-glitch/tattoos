import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  solo: {
    name: 'Solo Artist',
    price: 39,
    priceId: process.env.STRIPE_SOLO_PRICE_ID!,
    description: '1 artist, all core features, up to 200 clients',
    features: [
      'Online booking with deposit collection',
      'Digital consent forms',
      'Client design reference manager',
      'SMS & email reminders',
      'Waitlist management',
      'Revenue dashboard',
    ],
  },
  studio: {
    name: 'Studio',
    price: 79,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID!,
    description: 'Up to 4 artists, shared booking page, studio analytics',
    features: [
      'Everything in Solo',
      'Up to 4 artist calendars',
      'Shared studio booking page',
      'Studio-level analytics',
      'Priority support',
      'Multi-artist scheduling',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    description: '$19/artist/month · 5 seat minimum ($95/mo) for studios with 5+ artists',
    features: [
      'Everything in Studio',
      'Unlimited artists',
      'Per-seat pricing',
      'Custom booking domain',
      'API access',
      'Dedicated support',
    ],
  },
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata,
  quantity = 1,
}: {
  customerId?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
  quantity?: number
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata ?? {},
    subscription_data: {
      trial_period_days: 14,
      metadata: metadata ?? {},
    },
    allow_promotion_codes: true,
  })
  return session.url!
}

export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}

export async function createDepositPaymentIntent({
  amount,
  bookingId,
  artistName,
  clientEmail,
}: {
  amount: number
  bookingId: string
  artistName: string
  clientEmail: string
}) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency: 'usd',
    metadata: { bookingId, artistName },
    receipt_email: clientEmail,
    description: `Tattoo deposit — ${artistName}`,
  })
  return intent
}
