import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  className?: string
  href?: string
}

export function StatCard({ label, value, delta, deltaType = 'neutral', icon: Icon, iconColor = 'text-ink-400', className, href }: StatCardProps) {
  const inner = (
    <div className={cn(
      'rounded-xl border border-white/8 bg-surface-1 p-5 transition-colors',
      href && 'hover:bg-white/6 hover:border-white/12 cursor-pointer',
      className,
    )}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-white/50 font-medium">{label}</p>
        <div className={cn('rounded-lg p-2 bg-white/6', iconColor.replace('text-', 'bg-').replace('-400', '-500/15'))}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{value}</p>
        {delta && (
          <p className={cn(
            'mt-1 text-xs font-medium',
            deltaType === 'up'   && 'text-green-400',
            deltaType === 'down' && 'text-red-400',
            deltaType === 'neutral' && 'text-white/40',
          )}>
            {delta}
          </p>
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}
