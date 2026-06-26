import { NextRequest, NextResponse } from 'next/server'
import { createActionClient, createServiceClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = createActionClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { studio_name, artist_name } = body

  if (!studio_name || !artist_name) {
    return NextResponse.json({ error: 'studio_name and artist_name required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  const suffix = Math.random().toString(36).slice(2, 6)
  const studioSlug = `${slugify(studio_name)}-${suffix}`
  const artistSlug = `${slugify(artist_name)}-${suffix}`
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  // Create studio
  const { data: studio, error: studioError } = await serviceClient
    .from('studios')
    .insert({
      name: studio_name,
      slug: studioSlug,
      owner_id: session.user.id,
      subscription_status: 'trialing',
      trial_ends_at: trialEnd,
    })
    .select('id')
    .single()

  if (studioError) {
    return NextResponse.json({ error: studioError.message }, { status: 500 })
  }

  // Create artist profile
  const { error: artistError } = await serviceClient
    .from('artists')
    .insert({
      studio_id: studio.id,
      user_id: session.user.id,
      name: artist_name,
      slug: artistSlug,
      email: session.user.email,
      is_owner: true,
    })

  if (artistError) {
    return NextResponse.json({ error: artistError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, studio_id: studio.id })
}
