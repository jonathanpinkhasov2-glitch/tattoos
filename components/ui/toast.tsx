'use client'
import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastContextValue {
  toast: (opts: ToastOptions) => void
}

interface ToastOptions {
  title: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastOptions & { id: string })[]>([])

  const toast = React.useCallback((opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...opts, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const Icon = ({ type }: { type?: string }) => {
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
    if (type === 'error')   return <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
    return <Info className="h-5 w-5 text-blue-400 shrink-0" />
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-white/10 bg-surface-2 p-4 shadow-lg',
              'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
            )}
          >
            <Icon type={t.type} />
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-medium text-white">{t.title}</ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-white/50">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="text-white/30 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}
