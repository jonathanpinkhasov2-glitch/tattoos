import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookingSuccessPage({ params, searchParams }: {
  params: { slug: string }
  searchParams: { booking?: string }
}) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Booking request sent!</h1>
          <p className="text-white/60">
            Your artist will review your request and reach out to confirm your session and collect the deposit.
          </p>
        </div>

        {/* Steps */}
        <div className="rounded-xl border border-white/8 bg-surface-1 p-5 text-left space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wide font-medium">What happens next</p>
          {[
            { n: 1, text: 'Artist reviews your request (usually within 24 hrs)' },
            { n: 2, text: 'You\'ll receive an email to pay the deposit' },
            { n: 3, text: 'A digital consent form will be sent before your session' },
            { n: 4, text: 'Show up and get inked!' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3 text-sm">
              <div className="h-6 w-6 rounded-full bg-ink-500/20 text-ink-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {n}
              </div>
              <p className="text-white/60">{text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href={`/book/${params.slug}`}>
            <Button variant="outline" className="w-full">Book another session</Button>
          </Link>
        </div>

        <p className="text-xs text-white/30">
          Questions? The artist can be reached via the contact info in your confirmation email.
        </p>
      </div>
    </div>
  )
}
