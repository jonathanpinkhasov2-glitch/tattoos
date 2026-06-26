'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  formId: string
  token: string
  clientName: string
}

export function ConsentFormClient({ formId, token, clientName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  const [health, setHealth] = useState({
    is_pregnant: false,
    has_blood_disorder: false,
    has_skin_condition: false,
    has_allergies: false,
    on_blood_thinners: false,
    allergy_details: '',
    medical_notes: '',
  })

  const [sig, setSig] = useState({
    full_name: clientName,
    date_of_birth: '',
  })

  const setH = (key: string, val: boolean | string) => setHealth(h => ({ ...h, [key]: val }))

  const submit = async () => {
    if (!agreed || !sig.full_name || !sig.date_of_birth) return
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/consent-forms/${formId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...health, ...sig, token }),
    })

    if (res.ok) {
      router.push(`/consent/${token}/done`)
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: 'Failed to submit' }))
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Health questions */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
        <h2 className="text-white font-semibold">Health questions</h2>
        <p className="text-sm text-white/50">Please answer honestly. This helps your artist provide safe care.</p>

        {[
          { key: 'is_pregnant', label: 'Are you pregnant or breastfeeding?' },
          { key: 'has_blood_disorder', label: 'Do you have a blood disorder (hemophilia, HIV, hepatitis)?' },
          { key: 'has_skin_condition', label: 'Do you have a skin condition (psoriasis, eczema, keloids)?' },
          { key: 'has_allergies', label: 'Do you have known allergies to ink, latex, or numbing cream?' },
          { key: 'on_blood_thinners', label: 'Are you currently taking blood thinners or aspirin?' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-white/4">
            <div className="flex-1">
              <p className="text-sm text-white/80">{label}</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={key}
                  className="accent-ink-500"
                  checked={health[key as keyof typeof health] === true}
                  onChange={() => setH(key, true)}
                />
                <span className={health[key as keyof typeof health] === true ? 'text-yellow-400' : 'text-white/50'}>Yes</span>
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={key}
                  className="accent-ink-500"
                  checked={health[key as keyof typeof health] === false}
                  onChange={() => setH(key, false)}
                />
                <span className={health[key as keyof typeof health] === false ? 'text-green-400' : 'text-white/50'}>No</span>
              </label>
            </div>
          </div>
        ))}

        {health.has_allergies && (
          <Input
            label="Please describe your allergies"
            value={health.allergy_details}
            onChange={e => setH('allergy_details', e.target.value)}
            placeholder="Latex, certain inks, etc."
          />
        )}

        <Input
          label="Additional medical notes (optional)"
          value={health.medical_notes}
          onChange={e => setH('medical_notes', e.target.value)}
          placeholder="Anything else your artist should know..."
        />
      </div>

      {/* Consent text */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
        <h2 className="text-white font-semibold">Consent & release</h2>
        <div className="text-sm text-white/50 space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
          <p>I understand that tattooing is a permanent body modification. I consent to the application of a tattoo by the above named artist.</p>
          <p>I acknowledge that I am not under the influence of alcohol or drugs, and that I am of legal age (18+) to receive a tattoo.</p>
          <p>I understand that the healing process requires aftercare, and that the artist is not responsible for complications arising from improper aftercare or undisclosed medical conditions.</p>
          <p>I release the artist and studio from any liability related to adverse reactions, provided I have accurately disclosed my health information above.</p>
          <p>I understand that tattoo results can vary and that touch-ups may be required. I accept the tattoo as permanent art and acknowledge that satisfaction is subject to the artistic process.</p>
          <p>I have reviewed my design and placement and am satisfied. Minor changes to the design for aesthetic or technical reasons are permitted at the artist's discretion.</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 accent-ink-500"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
          />
          <span className="text-sm text-white/70">
            I have read and agree to the above consent and release terms.
          </span>
        </label>
      </div>

      {/* Signature */}
      <div className="rounded-xl border border-white/8 bg-surface-1 p-6 space-y-4">
        <h2 className="text-white font-semibold">Signature</h2>
        <Input
          label="Full legal name *"
          value={sig.full_name}
          onChange={e => setSig(s => ({ ...s, full_name: e.target.value }))}
          placeholder="Type your full name to sign"
          required
        />
        <Input
          label="Date of birth *"
          type="date"
          value={sig.date_of_birth}
          onChange={e => setSig(s => ({ ...s, date_of_birth: e.target.value }))}
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</div>
      )}

      <Button
        className="w-full"
        size="lg"
        loading={loading}
        disabled={!agreed || !sig.full_name || !sig.date_of_birth}
        onClick={submit}
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        Sign and submit
      </Button>

      <p className="text-xs text-white/25 text-center pb-4">
        By signing you confirm all information is accurate and you consent to the tattoo session.
      </p>
    </div>
  )
}
