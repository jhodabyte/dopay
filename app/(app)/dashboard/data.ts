import { MOCK_MODE, mockProperties, mockPayments, mockTenants, mockProfile } from '@/lib/mock-data'
import type { Property, Tenant, Payment, Profile } from '@/lib/types/database'

export interface DashboardKPIs {
  activeProperties: number
  paymentsThisMonth: number
  pendingPayments: number
  monthlyIncome: number
  activePropertiesTrend?: number
  paymentsThisMonthTrend?: number
  pendingPaymentsTrend?: number
  monthlyIncomeTrend?: number
}

export interface ActivityItem {
  id: string
  type: 'payment_registered' | 'new_tenant' | 'contract_ending'
  description: string
  timestamp: string
}

export interface PendingPaymentItem {
  paymentId: string
  tenantName: string
  propertyName: string
  propertyAddress: string
  amount: number
  dueDate: string
  status: 'pending' | 'overdue'
  daysOverdue: number
}

export interface MonthlyIncomeData {
  month: string
  income: number
}

export interface PropertyDistribution {
  active: number
  vacant: number
  overdue: number
  total: number
}

export interface DashboardData {
  kpis: DashboardKPIs
  activity: ActivityItem[]
  pendingPaymentsList: PendingPaymentItem[]
  monthlyIncome: MonthlyIncomeData[]
  propertyDistribution: PropertyDistribution
  profile: Profile
  properties: Property[]
}

function getMonthlyIncomeFromPayments(payments: Payment[]): MonthlyIncomeData[] {
  const now = new Date()
  const months: MonthlyIncomeData[] = []
  const spanishMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  for (let offset = 5; offset >= 0; offset--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()

    const income = payments
      .filter((payment) => {
        if (payment.status !== 'paid' || !payment.paid_date) return false
        const paidDate = new Date(payment.paid_date)
        return paidDate.getFullYear() === targetYear && paidDate.getMonth() === targetMonth
      })
      .reduce((total, payment) => total + payment.amount, 0)

    months.push({
      month: spanishMonths[targetMonth],
      income,
    })
  }

  return months
}

function buildActivityFromPayments(
  payments: Payment[],
  tenants: Tenant[],
  properties: Property[]
): ActivityItem[] {
  const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant]))
  const propertyMap = new Map(properties.map((property) => [property.id, property]))

  const paymentActivities: ActivityItem[] = payments
    .filter((payment) => payment.status === 'paid' && payment.paid_date)
    .sort((first, second) => new Date(second.paid_date!).getTime() - new Date(first.paid_date!).getTime())
    .slice(0, 5)
    .map((payment) => {
      const tenant = tenantMap.get(payment.tenant_id)
      const property = propertyMap.get(payment.property_id)
      const tenantName = tenant?.name ?? 'Arrendatario'
      const propertyName = property?.name ?? 'Propiedad'
      return {
        id: `activity-payment-${payment.id}`,
        type: 'payment_registered' as const,
        description: `${tenantName} realizó el pago de ${propertyName}`,
        timestamp: payment.paid_date!,
      }
    })

  const contractEndingActivities: ActivityItem[] = properties
    .filter((property) => {
      if (!property.contract_end) return false
      const endDate = new Date(property.contract_end)
      const now = new Date()
      const daysUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilEnd >= 0 && daysUntilEnd <= 30
    })
    .map((property) => ({
      id: `activity-contract-${property.id}`,
      type: 'contract_ending' as const,
      description: `Contrato de ${property.name} vence pronto`,
      timestamp: property.contract_end,
    }))

  const allActivities = [...paymentActivities, ...contractEndingActivities]
    .sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime())

  return allActivities.slice(0, 8)
}

function buildPendingPayments(
  payments: Payment[],
  tenants: Tenant[],
  properties: Property[]
): PendingPaymentItem[] {
  const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant]))
  const propertyMap = new Map(properties.map((property) => [property.id, property]))
  const now = new Date()

  return payments
    .filter((payment) => payment.status === 'pending' || payment.status === 'overdue')
    .map((payment) => {
      const tenant = tenantMap.get(payment.tenant_id)
      const property = propertyMap.get(payment.property_id)
      const dueDate = new Date(payment.due_date)
      const diffMs = now.getTime() - dueDate.getTime()
      const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

      return {
        paymentId: payment.id,
        tenantName: tenant?.name ?? 'Arrendatario',
        propertyName: property?.name ?? 'Propiedad',
        propertyAddress: property?.address ?? '',
        amount: payment.amount,
        dueDate: payment.due_date,
        status: payment.status as 'pending' | 'overdue',
        daysOverdue,
      }
    })
    .sort((first, second) => second.daysOverdue - first.daysOverdue)
}

export async function getDashboardData(): Promise<DashboardData> {
  if (MOCK_MODE) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const activeProperties = mockProperties.filter(
      (property) => property.status === 'active'
    ).length

    const paymentsThisMonth = mockPayments.filter((payment) => {
      if (payment.status !== 'paid' || !payment.paid_date) return false
      const paidDate = new Date(payment.paid_date)
      return paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth
    }).length

    const pendingPayments = mockPayments.filter(
      (payment) => payment.status === 'pending' || payment.status === 'overdue'
    ).length

    const monthlyIncome = mockPayments
      .filter((payment) => {
        if (payment.status !== 'paid' || !payment.paid_date) return false
        const paidDate = new Date(payment.paid_date)
        return paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth
      })
      .reduce((total, payment) => total + payment.amount, 0)

    const propertyDistribution: PropertyDistribution = {
      active: mockProperties.filter((p) => p.status === 'active').length,
      vacant: mockProperties.filter((p) => p.status === 'vacant').length,
      overdue: mockProperties.filter((p) => p.status === 'overdue').length,
      total: mockProperties.length,
    }

    return {
      kpis: {
        activeProperties,
        paymentsThisMonth,
        pendingPayments,
        monthlyIncome,
        activePropertiesTrend: 0,
        paymentsThisMonthTrend: 12,
        pendingPaymentsTrend: -5,
        monthlyIncomeTrend: 8,
      },
      activity: buildActivityFromPayments(mockPayments, mockTenants, mockProperties),
      pendingPaymentsList: buildPendingPayments(mockPayments, mockTenants, mockProperties),
      monthlyIncome: getMonthlyIncomeFromPayments(mockPayments),
      propertyDistribution,
      profile: mockProfile,
      properties: mockProperties,
    }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const [propertiesResult, paymentsResult, tenantsResult, profileResult] = await Promise.all([
    supabase.from('properties').select('*').eq('owner_id', user.id),
    supabase.from('payments').select('*'),
    supabase.from('tenants').select('*').eq('owner_id', user.id),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  const properties: Property[] = propertiesResult.data ?? []
  const payments: Payment[] = paymentsResult.data ?? []
  const tenants: Tenant[] = tenantsResult.data ?? []
  const profile: Profile = profileResult.data ?? {
    id: user.id,
    email: user.email ?? '',
    full_name: '',
    phone: '',
    created_at: new Date().toISOString(),
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const activeProperties = properties.filter((p) => p.status === 'active').length
  const paymentsThisMonth = payments.filter((payment) => {
    if (payment.status !== 'paid' || !payment.paid_date) return false
    const paidDate = new Date(payment.paid_date)
    return paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth
  }).length
  const pendingPayments = payments.filter(
    (payment) => payment.status === 'pending' || payment.status === 'overdue'
  ).length
  const monthlyIncome = payments
    .filter((payment) => {
      if (payment.status !== 'paid' || !payment.paid_date) return false
      const paidDate = new Date(payment.paid_date)
      return paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth
    })
    .reduce((total, payment) => total + payment.amount, 0)

  const propertyDistribution: PropertyDistribution = {
    active: properties.filter((p) => p.status === 'active').length,
    vacant: properties.filter((p) => p.status === 'vacant').length,
    overdue: properties.filter((p) => p.status === 'overdue').length,
    total: properties.length,
  }

  return {
    kpis: {
      activeProperties,
      paymentsThisMonth,
      pendingPayments,
      monthlyIncome,
    },
    activity: buildActivityFromPayments(payments, tenants, properties),
    pendingPaymentsList: buildPendingPayments(payments, tenants, properties),
    monthlyIncome: getMonthlyIncomeFromPayments(payments),
    propertyDistribution,
    profile,
    properties,
  }
}
