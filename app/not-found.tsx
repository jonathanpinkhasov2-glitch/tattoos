import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="text-center space-y-6 animate-fade-in max-w-sm">
        <div className="text-7xl font-bold text-gradient">404</div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Page not found</h1>
          <p className="text-white/50 text-sm">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
