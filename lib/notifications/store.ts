'use client'

export type NotificationType = 'payment_overdue' | 'payment_upcoming' | 'payment_registered'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  read: boolean
  createdAt: string
}

const STORAGE_KEY = 'dopay_notifications'

function loadFromStorage(): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AppNotification[]
  } catch {
    return []
  }
}

function saveToStorage(notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

export function getNotifications(): AppNotification[] {
  return loadFromStorage()
}

export function markAsRead(id: string): void {
  const notifications = loadFromStorage()
  const updated = notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  )
  saveToStorage(updated)
}

export function markAllAsRead(): void {
  const notifications = loadFromStorage()
  const updated = notifications.map((notification) => ({ ...notification, read: true }))
  saveToStorage(updated)
}

export function seedNotificationsIfEmpty(seed: AppNotification[]): void {
  if (typeof window === 'undefined') return
  const existing = loadFromStorage()
  if (existing.length === 0) {
    saveToStorage(seed)
  }
}
