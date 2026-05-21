'use client'

import { CheckCircle, UserPlus, AlertCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { ActivityItem } from '@/app/(app)/dashboard/data'

interface ActivityFeedProps {
  items: ActivityItem[]
}

const ACTIVITY_CONFIG = {
  payment_registered: {
    icon: CheckCircle,
    bgColor: 'rgba(16,185,129,0.1)',
    iconColor: '#10B981',
  },
  new_tenant: {
    icon: UserPlus,
    bgColor: 'rgba(0,98,255,0.1)',
    iconColor: '#0062FF',
  },
  contract_ending: {
    icon: AlertCircle,
    bgColor: 'rgba(245,158,11,0.1)',
    iconColor: '#F59E0B',
  },
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full mb-3"
          style={{ backgroundColor: 'rgba(156,163,175,0.1)' }}
        >
          <CheckCircle className="w-6 h-6" style={{ color: '#9CA3AF' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          Sin actividad reciente
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Las acciones aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div>
      {items.map((item, index) => {
        const config = ACTIVITY_CONFIG[item.type]
        const IconComponent = config.icon

        return (
          <div key={item.id}>
            <div className="flex items-start gap-3 py-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: config.bgColor }}
              >
                <IconComponent className="w-4 h-4" style={{ color: config.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
                  {item.description}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
            {index < items.length - 1 && (
              <div className="border-b border-gray-100" />
            )}
          </div>
        )
      })}
    </div>
  )
}
