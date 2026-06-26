import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const body = await req.json()

  const {
    token, full_name, date_of_birth,
    is_pregnant, has_blood_disorder, has_skin_condition,
    has_allergies, on_blood_thinners, allergy_details, medical_notes,
  } = body

  // Verify token matches
  const { data: form } = await supabase
    .from('consent_forms')
    .select('id, token, status')
    .eq('id', params.id)
    .single()

  if (!form || form.token !== token) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 403 })
  }

  if (form.status === 'signed') {
    return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  }

  const { error } = await supabase
    .from('consent_forms')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      full_name,
      date_of_birth,
      is_pregnant: is_pregnant ?? false,
      has_blood_disorder: has_blood_disorder ?? false,
      has_skin_condition: has_skin_condition ?? false,
      has_allergies: has_allergies ?? false,
      on_blood_thinners: on_blood_thinners ?? false,
      allergy_details: allergy_details || null,
      medical_notes: medical_notes || null,
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
