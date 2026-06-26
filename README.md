# TattooOS

**The native management platform built for tattoo artists.**

Booking, clients, consent forms, deposits, and waitlists — one beautifully designed tool, built for the shop.

---

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **Supabase** (PostgreSQL, Auth, Row Level Security)
- **Stripe** (subscriptions, deposits via PaymentIntents)
- **Tailwind CSS** (custom ink-purple brand palette, dark surfaces)
- **TypeScript** (strict mode throughout)
- **Radix UI** (accessible primitives)

---

## Pricing

| Plan | Price | Artists |
|------|-------|---------|
| Solo Artist | $39/mo | 1 |
| Studio | $79/mo | Up to 5 |
| Pro Studio | $19/artist/mo | Unlimited |

All plans start with a **14-day free trial**.

---

## Quick Setup

### 1. Clone and install

```bash
git clone <repo>
cd tattooos
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret!)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `STRIPE_SECRET_KEY` — from Stripe dashboard (keep secret!)
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhook endpoint
- `STRIPE_SOLO_PRICE_ID` — Price ID for Solo plan ($39/mo)
- `STRIPE_STUDIO_PRICE_ID` — Price ID for Studio plan ($79/mo)
- `STRIPE_PRO_PRICE_ID` — Price ID for Pro plan ($19/artist/mo)
- `NEXT_PUBLIC_APP_URL` — Your deployed URL (e.g. `https://tattooos.app`)

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full schema:
   ```
   supabase/schema.sql
   ```
3. This creates all tables, RLS policies, indexes, and helper functions.

### 4. Set up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create 3 subscription products with monthly prices:
   - **Solo Artist** — $39/month → copy the Price ID to `STRIPE_SOLO_PRICE_ID`
   - **Studio** — $79/month → copy the Price ID to `STRIPE_STUDIO_PRICE_ID`
   - **Pro Studio** — $19/month → copy the Price ID to `STRIPE_PRO_PRICE_ID`
3. Set up a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`
4. Enable these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all env vars in Vercel project settings
4. Deploy — Vercel auto-detects Next.js

**Important:** Update `NEXT_PUBLIC_APP_URL` to your Vercel URL before deploying.

---

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/signup` | Sign up (2-step: account → studio/artist) |
| `/login` | Login |
| `/dashboard` | Main dashboard with stats |
| `/calendar` | Monthly calendar view |
| `/bookings` | Booking list with search/filter |
| `/bookings/new` | Create booking manually |
| `/bookings/[id]` | Booking detail + actions |
| `/clients` | Client list |
| `/clients/[id]` | Client profile + history |
| `/waitlist` | Waitlist management |
| `/settings` | Studio + artist profile settings |
| `/settings/billing` | Subscription management |
| `/book/[slug]` | **Public** booking page for clients |
| `/consent/[token]` | **Public** digital consent form |

---

## Architecture

```
app/
├── (auth)/         # Login, signup (centered layout)
├── (dashboard)/    # Protected dashboard pages (sidebar layout)
│   ├── dashboard/
│   ├── calendar/
│   ├── bookings/
│   ├── clients/
│   ├── waitlist/
│   └── settings/
├── book/[slug]/    # Public booking pages (no auth)
├── consent/[token]/ # Public consent form signing (no auth)
└── api/            # API routes
    ├── onboarding/
    ├── bookings/
    ├── consent-forms/
    ├── create-checkout/
    ├── billing-portal/
    └── webhooks/stripe/

components/
├── ui/             # Design system (Button, Input, Badge, Modal, etc.)
└── dashboard/      # Dashboard-specific components

lib/
├── supabase/       # Client, server, service clients
├── stripe.ts       # Stripe helpers + checkout
└── utils.ts        # cn(), formatters, slugify, etc.

supabase/
└── schema.sql      # Complete DB schema with RLS
```

---

## Exit Strategy

TattooOS targets a **$300K–$500K exit** within 18-24 months via [Acquire.com](https://acquire.com) or [Flippa](https://flippa.com).

At the market median of **3.9x ARR**:
- $100K ARR → $390K exit
- $150K ARR → $585K exit

**Path to $100K ARR:**
- 215 Solo artists ($39/mo) = $100,620/yr
- Or 107 Studio accounts ($79/mo) = $101,388/yr
- Or a mix: 100 Solo + 50 Studio = ~$94,200/yr

**Acquisition channels:**
- Instagram/TikTok tattoo artist communities (organic)
- Direct DM outreach to local studios
- Tattoo convention sponsorships
- SEO: "tattoo booking software", "tattoo artist app"

---

## Business Plan

See `TattooOS_Business_Plan.docx` for the full business plan including competitor analysis, financial projections, and go-to-market strategy.
