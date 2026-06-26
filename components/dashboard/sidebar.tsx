'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Users, FileText, Clock,
  Settings, LogOut, Zap, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { label: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Calendar',      href: '/calendar',       icon: Calendar },
  { label: 'Bookings',      href: '/bookings',       icon: FileText },
  { label: 'Clients',       href: '/clients',        icon: Users },
  { label: 'Waitlist',      href: '/waitlist',       icon: Clock },
  { label: 'Settings',      href: '/settings',       icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-ink-600/20 text-ink-300 border border-ink-500/30'
                : 'text-white/50 hover:bg-white/6 hover:text-white/80'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-ink-400' : 'text-white/40')} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-surface-2 border border-white/10 text-white/60"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-white/8 flex flex-col">
            <div className="flex items-center justify-between p-5">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 px-3 overflow-y-auto">
              <NavLinks />
            </div>
            <LogoutBtn onClick={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/8 bg-surface-1 min-h-screen">
        <div className="p-5 border-b border-white/8">
          <Logo />
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <NavLinks />
        </div>
        <LogoutBtn onClick={handleLogout} />
      </aside>
    </>
  )
}

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-lg ink-gradient flex items-center justify-center">
        <Zap className="h-4 w-4 text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        Tattoo<span className="text-gradient">OS</span>
      </span>
    </Link>
  )
}

function LogoutBtn({ onClick }: { onClick: () => void }) {
  return (
    <div className="p-3 border-t border-white/8">
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 hover:bg-white/6 hover:text-white/70 transition-all"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </div>
  )
}
