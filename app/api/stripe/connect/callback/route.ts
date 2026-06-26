import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('account')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (!accountId) {
    return NextResponse.redirect(`${appUrl}/settings?connect=error`)
  }

  // Check if account completed onboarding
  try {
    const account = await stripe.accounts.retrieve(accountId)
    if (account.details_submitted) {
      // Mark as connected in our DB
      const serviceClient = createServiceClient()
      await serviceClient
        .from('artists')
        .update({ stripe_account_id: accountId })
        .eq('stripe_account_id', accountId)
      return NextResponse.redirect(`${appUrl}/settings?connect=success`)
    } else {
      return NextResponse.redirect(`${appUrl}/settings?connect=incomplete`)
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?connect=error`)
  }
}
