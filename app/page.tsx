import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Zap, Calendar, FileText, Users, Clock, Shield,
  Star, ArrowRight, CheckCircle, Instagram
} from 'lucide-react'

const FEATURES = [
  {
    icon: Calendar,
    title: 'Smart Booking + Deposits',
    desc: 'Online booking with automatic deposit collection via Stripe. Custom deposit amounts, variable session lengths, and automatic reminders.',
    color: 'text-ink-400',
    bg: 'bg-ink-500/10',
  },
  {
    icon: Shield,
    title: 'Digital Consent Forms',
    desc: 'State-compliant consent forms sent automatically before every appointment. Signed on the client\'s phone. Stored forever.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FileText,
    title: 'Design Reference Manager',
    desc: 'Clients upload references at booking. You add stencils and healed photos. Every client\'s full tattoo history in one place.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Users,
    title: 'Client Management',
    desc: 'Full client profiles with health notes, allergies, session history, and total spend. Know your clients before they walk in.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Clock,
    title: 'Waitlist Management',
    desc: 'Build a waitlist. When a cancellation hits, offer the slot to the next person with one click. Never leave an empty chair.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Zap,
    title: 'Revenue Dashboard',
    desc: 'Monthly revenue, new vs. returning clients, average session value. Clean numbers for tax time and business decisions.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
]

const TESTIMONIALS = [
  {
    quote: "I was spending 8 hours a week on DMs, Venmo requests, and paper forms. TattooOS cut that to under an hour.",
    name: "Marcus T.",
    studio: "Blackline Studio, LA",
  },
  {
    quote: "The consent form thing alone was worth it. Health inspector walked in, I pulled up the iPad. Done.",
    name: "Jade K.",
    studio: "Solo artist, Austin",
  },
  {
    quote: "My waitlist is 3 months long now. The one-click slot offer to clients is insane — fills cancellations in minutes.",
    name: "Diego R.",
    studio: "Ink & Iron Collective, Miami",
  },
]

const PLANS = [
  {
    name: 'Solo Artist',
    price: 39,
    desc: '1 artist, all features, up to 200 clients',
    features: ['Online booking + deposits', 'Digital consent forms', 'Design reference manager', 'Client CRM', 'Waitlist management', 'Revenue dashboard'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Studio',
    price: 79,
    desc: 'Up to 4 artists, shared booking page',
    features: ['Everything in Solo', 'Up to 4 artist calendars', 'Shared studio booking page', 'Studio analytics', 'Priority support', 'Multi-artist scheduling'],
    cta: 'Start free trial',
    highlight: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Nav */}
      <nav className="border-b border-white/6 sticky top-0 z-50 bg-surface-0/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg ink-gradient flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Tattoo<span className="text-gradient">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start free trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-500/30 bg-ink-500/10 px-4 py-1.5 text-sm text-ink-300 mb-8">
          <Zap className="h-3.5 w-3.5" />
          Built exclusively for tattoo artists
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
          Stop running your
          <br />
          <span className="text-gradient">business from your DMs</span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          TattooOS is the first management platform built natively for tattoo artists.
          Online booking with deposits, digital consent forms, and client management
          — the way your workflow actually works.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start your 14-day free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-white/30">No credit card required</p>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { n: '28K+', l: 'Studios in US' },
            { n: '9/10', l: 'Market gap score' },
            { n: '$0', l: 'Commission on bookings' },
          ].map(({ n, l }) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-bold text-white">{n}</p>
              <p className="text-sm text-white/40 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/6 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for how you actually work
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Every tool was designed around the tattoo workflow — not copied from a hair salon platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-xl border border-white/8 bg-surface-1 p-6 hover:border-white/15 transition-colors">
                <div className={`inline-flex rounded-lg p-2.5 mb-4 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/6 py-24 bg-surface-1/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Artists love it</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, studio }) => (
              <div key={name} className="rounded-xl border border-white/8 bg-surface-1 p-6">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{quote}"</p>
                <div>
                  <p className="text-white font-medium text-sm">{name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{studio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/6 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple pricing</h2>
            <p className="text-white/50">14-day free trial. No credit card required. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map(({ name, price, desc, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-xl border p-8 ${
                  highlight
                    ? 'border-ink-500/50 bg-ink-600/10 shadow-[0_0_40px_rgba(124,58,237,0.15)]'
                    : 'border-white/8 bg-surface-1'
                }`}
              >
                {highlight && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-ink-500/20 border border-ink-500/30 px-3 py-1 text-xs font-medium text-ink-300 mb-4">
                    Most popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="text-white/50 text-sm mt-1 mb-6">{desc}</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  <span className="text-white/40 mb-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant={highlight ? 'default' : 'outline'} className="w-full">{cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/6 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to get your time back?
          </h2>
          <p className="text-white/50 mb-8">
            Join thousands of artists who stopped managing their business from their DMs.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Start your free trial — no card required
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-ink-400" />
            <span className="text-sm font-semibold text-white/60">TattooOS</span>
          </div>
          <p className="text-xs text-white/30">© 2026 TattooOS. Built for artists, by someone who got tired of watching them waste time.</p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="#" className="hover:text-white/70">Privacy</Link>
            <Link href="#" className="hover:text-white/70">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
