import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PaymentStatus, PropertyStatus } from './types'

export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return 'hace un momento'
  if (diffMinutes < 60) return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  if (diffMonths < 12) return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
  return `hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`
}

export function calculateDaysOverdue(dueDateString: string): number {
  const dueDate = new Date(dueDateString)
  const now = new Date()
  const diffMs = now.getTime() - dueDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    paid: 'Pagado',
    pending: 'Pendiente',
    overdue: 'Vencido',
  }
  return labels[status]
}

export function getPropertyStatusLabel(status: PropertyStatus): string {
  const labels: Record<PropertyStatus, string> = {
    active: 'Activa',
    vacant: 'Desocupada',
    overdue: 'En mora',
  }
  return labels[status]
}
