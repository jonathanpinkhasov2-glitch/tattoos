import { CheckCircle2 } from 'lucide-react'

export default function ConsentDonePage() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="text-center max-w-sm space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Consent form signed!</h1>
          <p className="text-white/60">Your artist has been notified. See you at your session — we can't wait to create something amazing together.</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-surface-1 p-4 text-sm text-white/50">
          A copy of this consent form has been securely stored. You may request a copy from your artist.
        </div>
      </div>
    </div>
  )
}
