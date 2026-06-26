import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/70">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 text-white/40 pointer-events-none">{prefix}</div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors',
              'focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              prefix && 'pl-9',
              suffix && 'pr-9',
              error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-white/40 pointer-events-none">{suffix}</div>
          )}
        </div>
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Textarea variant
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/70">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors resize-none',
            'focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/60 focus:border-red-500',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }
