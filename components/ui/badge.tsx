import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-ink-600/20 text-ink-300 border border-ink-500/30',
        success:  'bg-green-500/15 text-green-400 border border-green-500/25',
        warning:  'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
        danger:   'bg-red-500/15 text-red-400 border border-red-500/25',
        info:     'bg-blue-500/15 text-blue-400 border border-blue-500/25',
        neutral:  'bg-white/8 text-white/60 border border-white/10',
        outline:  'border border-white/20 text-white/60',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
