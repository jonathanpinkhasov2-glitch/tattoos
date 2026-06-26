import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date helpers ────────────────────────────────────────────────────────────

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`
  if (isTomorrow(d)) return `Tomorrow at ${format(d, 'h:mm a')}`
  return format(d, 'EEE, MMM d · h:mm a')
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatTime(time: string): string {
  // time is HH:MM
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getDayName(dayOfWeek: number): string {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek]
}

// ─── Money helpers ───────────────────────────────────────────────────────────

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateDeposit(total: number, type: 'flat' | 'percent', amount: number): number {
  if (type === 'flat') return amount
  return Math.round(total * (amount / 100) * 100) / 100
}

// ─── String helpers ──────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's')
}

// ─── Status helpers ──────────────────────────────────────────────────────────

export function bookingStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending:   'text-yellow-400 bg-yellow-400/10',
    confirmed: 'text-blue-400 bg-blue-400/10',
    completed: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    no_show:   'text-gray-400 bg-gray-400/10',
  }
  return map[status] ?? 'text-gray-400 bg-gray-400/10'
}

export function consentStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    signed:  'text-green-400 bg-green-400/10',
    expired: 'text-red-400 bg-red-400/10',
  }
  return map[status] ?? 'text-gray-400 bg-gray-400/10'
}

// ─── Validation helpers ──────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{10,}$/.test(phone)
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

export function getBookingUrl(artistSlug: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/book/${artistSlug}`
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}
