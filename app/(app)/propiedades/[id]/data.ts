import { MOCK_MODE, mockProperties, mockTenants, mockPayments } from '@/lib/mock-data'
import type { Property, Tenant, Payment } from '@/lib/types/database'

interface PropertyDetail {
  property: Property
  tenant: Tenant | null
  payments: Payment[]
}

export async function getPropertyDetail(propertyId: string): Promise<PropertyDetail | null> {
  if (MOCK_MODE) {
    const property = mockProperties.find((p) => p.id === propertyId) ?? mockProperties[0]
    const tenant = property.tenant_id
      ? (mockTenants.find((t) => t.id === property.tenant_id) ?? null)
      : null
    const payments = mockPayments.filter((payment) => payment.property_id === property.id)
    return { property, tenant, payments }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .eq('owner_id', user.id)
    .single()

  if (propError || !property) return null

  const { data: tenant } = property.tenant_id
    ? await supabase.from('tenants').select('*').eq('id', property.tenant_id).single()
    : { data: null }

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('property_id', propertyId)
    .order('due_date', { ascending: false })

  return { property, tenant: tenant ?? null, payments: payments ?? [] }
}
