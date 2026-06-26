'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="text-center space-y-6 animate-fade-in max-w-sm">
        <div className="text-5xl">⚡</div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="text-white/50 text-sm">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-xs text-white/25 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
