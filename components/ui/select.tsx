'use client'
import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function Select({ value, onValueChange, placeholder, label, error, disabled, children, className }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white',
            'focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[placeholder]:text-white/30',
            error && 'border-red-500/60',
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-white/40" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/10 bg-surface-2 shadow-xl animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-white/80 outline-none hover:bg-white/8 hover:text-white focus:bg-white/8 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check className="h-4 w-4 text-ink-400" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
