'use client'

import { Bell, Menu } from 'lucide-react'
import Button from '@/components/ui/Button'

interface TopbarProps {
  title: string
  subtitle: string
  ctaLabel?: string
  onCtaClick?: () => void
  notificationCount?: number
  onMobileMenuClick?: () => void
}

export default function Topbar({
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
  notificationCount,
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
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          {notificationCount !== undefined && notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-semibold">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {ctaLabel && onCtaClick && (
          <Button variant="primary" size="sm" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </header>
  )
}
