// ─── Database Types ──────────────────────────────────────────────────────────

export type SubscriptionPlan = 'solo' | 'studio' | 'pro'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type TattooSize = 'small' | 'medium' | 'large' | 'full_sleeve' | 'other'
export type DepositType = 'flat' | 'percent'
export type DesignRefType = 'reference' | 'stencil' | 'healed' | 'progress' | 'other'
export type WaitlistStatus = 'waiting' | 'contacted' | 'booked' | 'removed'
export type ConsentStatus = 'pending' | 'signed' | 'expired'

export interface Studio {
  id: string
  owner_id: string
  name: string
  slug: string
  bio?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email?: string
  website?: string
  instagram?: string
  timezone?: string
  logo_url?: string
  cover_url?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_plan: SubscriptionPlan
  subscription_status: SubscriptionStatus
  trial_ends_at?: string
  created_at: string
  updated_at: string
}

export interface Artist {
  id: string
  user_id?: string
  studio_id: string
  name: string
  slug: string
  email?: string
  bio?: string
  specialties?: string[]
  styles?: string[]
  avatar_url?: string
  instagram?: string
  is_owner?: boolean
  booking_enabled: boolean
  deposit_required: boolean
  deposit_type: DepositType
  deposit_amount: number
  deposit_percentage?: number
  min_session_minutes: number
  max_advance_days: number
  buffer_minutes: number
  hourly_rate?: number
  created_at: string
  updated_at: string
  // Relations
  studio?: Studio
  availability?: Availability[]
}

export interface Availability {
  id: string
  artist_id: string
  day_of_week: number // 0=Sun, 6=Sat
  start_time: string  // HH:MM
  end_time: string    // HH:MM
  created_at: string
}

export interface BlockedDate {
  id: string
  artist_id: string
  blocked_date: string // YYYY-MM-DD
  reason?: string
  created_at: string
}

export interface Client {
  id: string
  studio_id: string
  artist_id?: string
  first_name: string
  last_name?: string
  /** Computed: first_name + ' ' + last_name */
  name: string
  email?: string
  phone?: string
  date_of_birth?: string
  pronouns?: string
  notes?: string
  allergies?: string
  medical_notes?: string
  referral_source?: string
  is_blocked?: boolean
  total_sessions: number
  total_spent: number
  created_at: string
  updated_at: string
  // Relations
  design_references?: DesignReference[]
  bookings?: Booking[]
}

export interface DesignReference {
  id: string
  client_id: string
  booking_id?: string
  url: string
  type: DesignRefType
  notes?: string
  created_at: string
}

export interface Booking {
  id: string
  studio_id: string
  artist_id: string
  client_id?: string
  client_name: string
  client_email: string
  client_phone?: string
  tattoo_description?: string
  placement?: string
  size?: TattooSize
  style?: string
  is_color: boolean
  is_cover_up: boolean
  scheduled_at: string
  duration_minutes: number
  status: BookingStatus
  deposit_amount: number
  deposit_paid: boolean
  deposit_paid_at?: string
  session_price?: number
  total_paid: number
  stripe_payment_intent_id?: string
  reminder_24h_sent: boolean
  reminder_2h_sent: boolean
  notes?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  // Relations
  artist?: Artist
  client?: Client
  consent_form?: ConsentForm
  design_references?: DesignReference[]
}

export interface ConsentForm {
  id: string
  booking_id: string
  client_id?: string
  token?: string
  full_name?: string
  date_of_birth?: string
  email?: string
  phone?: string
  medical_notes?: string
  is_pregnant: boolean
  has_blood_disorder: boolean
  has_skin_condition: boolean
  has_allergies: boolean
  allergy_details?: string
  on_blood_thinners: boolean
  medications?: string
  additional_health?: string
  consent_age_verified: boolean
  consent_health_true: boolean
  consent_aftercare: boolean
  consent_photo_release: boolean
  consent_no_guarantee: boolean
  signature_url?: string
  signed_at?: string
  ip_address?: string
  status: ConsentStatus
  sent_at?: string
  created_at: string
}

export interface WaitlistEntry {
  id: string
  artist_id: string
  client_name: string
  client_email: string
  client_phone?: string
  tattoo_description?: string
  placement?: string
  size?: string
  preferred_days?: string[]
  flexible_schedule: boolean
  deposit_paid: boolean
  deposit_amount: number
  priority: number
  status: WaitlistStatus
  offered_at?: string
  notes?: string
  created_at: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface ArtistStats {
  total_bookings: number
  completed: number
  revenue: number
  new_clients: number
  avg_session_mins: number
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface BookingFormData {
  client_name: string
  client_email: string
  client_phone?: string
  tattoo_description: string
  placement: string
  size: TattooSize
  style?: string
  is_color: boolean
  is_cover_up: boolean
  scheduled_at: string
  duration_minutes: number
  notes?: string
}

export interface ConsentFormData {
  full_name: string
  date_of_birth: string
  email: string
  phone?: string
  is_pregnant: boolean
  has_blood_disorder: boolean
  has_skin_condition: boolean
  has_allergies: boolean
  allergy_details?: string
  on_blood_thinners: boolean
  medications?: string
  additional_health?: string
  consent_age_verified: boolean
  consent_health_true: boolean
  consent_aftercare: boolean
  consent_photo_release: boolean
  consent_no_guarantee: boolean
}

// ─── Nav Types ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}
