import Image from 'next/image'
import Link from 'next/link'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-iw-border bg-iw-surface p-8 shadow-[0_0_80px_-20px_rgba(121,194,76,0.12)]">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Islam.wiki"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-lg font-bold">
              <span className="text-white">Islam</span>
              <span className="text-iw-text-muted">.</span>
              <span className="text-iw-accent">wiki</span>
            </span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-iw-text-secondary">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  )
}
