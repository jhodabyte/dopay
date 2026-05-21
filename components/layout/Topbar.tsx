'use client'

import { Menu } from 'lucide-react'
import Button from '@/components/ui/Button'
import NotificationBell from '@/components/notifications/NotificationBell'

interface TopbarProps {
  title: string
  subtitle: string
  ctaLabel?: string
  onCtaClick?: () => void
  onMobileMenuClick?: () => void
}

export default function Topbar({
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
  onMobileMenuClick,
}: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 bg-white border-b"
      style={{ height: '72px', borderColor: '#F7F8FA' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
        </button>
        <div>
          <h1
            className="text-xl leading-tight"
            style={{ fontWeight: 700, color: 'var(--color-text)' }}
          >
            {title}
          </h1>
          <p
            className="text-sm leading-tight"
            style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        {ctaLabel && onCtaClick && (
          <Button variant="primary" size="sm" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </header>
  )
}
