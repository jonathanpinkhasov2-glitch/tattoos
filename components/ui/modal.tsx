'use client'
import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 p-4',
            sizeMap[size]
          )}
        >
          <div className="rounded-xl border border-white/10 bg-surface-1 shadow-2xl animate-in fade-in-0 zoom-in-95">
            {(title || description) && (
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  {title && <Dialog.Title className="text-lg font-semibold text-white">{title}</Dialog.Title>}
                  {description && (
                    <Dialog.Description className="mt-1 text-sm text-white/50">{description}</Dialog.Description>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className={cn('px-6 pb-6', !(title || description) && 'pt-6')}>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
