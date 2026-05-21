'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  seedNotificationsIfEmpty,
  type AppNotification,
  type NotificationType,
} from '@/lib/notifications/store'
import { mockNotifications } from '@/lib/mock-notifications'

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  payment_overdue: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
  },
  payment_upcoming: {
    icon: <Clock className="w-4 h-4" />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
  payment_registered: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    seedNotificationsIfEmpty(mockNotifications)
    setNotifications(getNotifications())
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const unreadCount = notifications.filter((n) => !n.read).length

  function handleMarkAsRead(id: string) {
    markAsRead(id)
    setNotifications(getNotifications())
  }

  function handleMarkAllAsRead() {
    markAllAsRead()
    setNotifications(getNotifications())
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((previous) => !previous)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Notificaciones${unreadCount > 0 ? ` — ${unreadCount} sin leer` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-semibold"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          style={{ width: '360px', maxHeight: '480px' }}
          role="dialog"
          aria-label="Panel de notificaciones"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium hover:underline transition-colors"
                style={{ color: '#0062FF' }}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '412px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ backgroundColor: 'rgba(0,98,255,0.08)' }}
                >
                  <Bell className="w-6 h-6" style={{ color: '#0062FF' }} />
                </div>
                <p className="text-sm text-center" style={{ color: '#4B5563' }}>
                  No tienes notificaciones pendientes
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = typeConfig[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'group flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-default',
                      !notification.read && 'bg-blue-50/40'
                    )}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: config.bg, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm leading-snug',
                          !notification.read ? 'font-semibold' : 'font-medium'
                        )}
                        style={{ color: '#1A1A1A' }}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: '#4B5563' }}>
                        {notification.description}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs shrink-0 self-start mt-1 transition-opacity hover:underline"
                        style={{ color: '#0062FF' }}
                      >
                        Leído
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
