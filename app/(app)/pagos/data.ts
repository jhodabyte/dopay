import { MOCK_MODE, mockPayments, mockProperties, mockTenants } from '@/lib/mock-data'
import type { PaymentWithDetails } from '@/lib/types'

export interface PaymentsSummary {
  totalCollectedThisMonth: number
  pendingCount: number
  overdueCount: number
  upcomingCount: number
}

export async function getPaymentsData(_ownerId: string): Promise<{ payments: PaymentWithDetails[] }> {
  if (MOCK_MODE) {
    const payments: PaymentWithDetails[] = mockPayments.map((payment) => ({
      ...payment,
      property: mockProperties.find((p) => p.id === payment.property_id) ?? null,
      tenant: mockTenants.find((t) => t.id === payment.tenant_id) ?? null,
    }))
    return { payments }
  }

  return { payments: [] }
}

export async function getPaymentsSummary(_ownerId: string): Promise<PaymentsSummary> {
  if (MOCK_MODE) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const totalCollectedThisMonth = mockPayments
      .filter((p) => {
        if (p.status !== 'paid' || !p.paid_date) return false
        const paidDate = new Date(p.paid_date)
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
      })
      .reduce((sum, p) => sum + p.amount, 0)

    const pendingCount = mockPayments.filter((p) => p.status === 'pending').length
    const overdueCount = mockPayments.filter((p) => p.status === 'overdue').length

    const upcomingCount = mockPayments.filter((p) => {
      if (p.status !== 'pending') return false
      const dueDate = new Date(p.due_date)
      return dueDate >= now && dueDate <= sevenDaysFromNow
    }).length

    return { totalCollectedThisMonth, pendingCount, overdueCount, upcomingCount }
  }

  return { totalCollectedThisMonth: 0, pendingCount: 0, overdueCount: 0, upcomingCount: 0 }
}
