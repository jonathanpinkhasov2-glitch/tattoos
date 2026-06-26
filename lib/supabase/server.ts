import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// For Server Components
export function createServerClient() {
  return createServerComponentClient({ cookies })
}

// For Server Actions
export function createActionClient() {
  return createServerActionClient({ cookies })
}

// For API routes that need service role (bypasses RLS)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
