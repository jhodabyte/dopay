import { MOCK_MODE, mockPayments, mockProperties, mockTenants } from '@/lib/mock-data'
import type { Payment, Property, Tenant } from '@/lib/types'

export interface TenantDetail {
  tenant: Tenant
  payments: Payment[]
  properties: Property[]
}

export async function getTenantDetail(tenantId: string, _ownerId: string): Promise<TenantDetail | null> {
  if (MOCK_MODE) {
    const tenant = mockTenants.find((t) => t.id === tenantId) ?? mockTenants[0]
    if (!tenant) return null

    const payments = mockPayments.filter((p) => p.tenant_id === tenant.id)
    const properties = mockProperties.filter((p) => p.tenant_id === tenant.id)

    return { tenant, payments, properties }
  }

  return null
}

export function computeTenantStats(payments: Payment[], tenant: Tenant) {
  const paidPayments = payments.filter((p) => p.status === 'paid')
  const pendingPayments = payments.filter((p) => p.status === 'pending')

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  const avgDaysLate =
    paidPayments.length > 0
      ? Math.round(
          paidPayments.reduce((sum, p) => {
            if (!p.paid_date) return sum
            const dueDate = new Date(p.due_date)
            const paidDate = new Date(p.paid_date)
            const diffDays = Math.max(
              0,
              Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            )
            return sum + diffDays
          }, 0) / paidPayments.length
        )
      : 0

  const createdAt = new Date(tenant.created_at)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth())
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const tenancyDuration =
    years > 0
      ? `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? ` ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`
      : `${months} ${months === 1 ? 'mes' : 'meses'}`

  const nextPayment = pendingPayments
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .at(0) ?? null

  const last6MonthsCompliance = computeLast6MonthsCompliance(payments)

  return { totalPaid, totalPending, avgDaysLate, tenancyDuration, nextPayment, last6MonthsCompliance }
}

function computeLast6MonthsCompliance(payments: Payment[]) {
  const result: { month: string; paid: number; pending: number }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })

    const monthPayments = payments.filter((p) => {
      const due = new Date(p.due_date)
      return due.getMonth() === date.getMonth() && due.getFullYear() === date.getFullYear()
    })

    const paid = monthPayments.filter((p) => p.status === 'paid').length
    const pending = monthPayments.filter((p) => p.status !== 'paid').length

    result.push({ month: monthLabel, paid, pending })
  }

  return result
}
