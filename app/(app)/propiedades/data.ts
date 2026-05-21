import { MOCK_MODE, mockProperties, mockTenants } from '@/lib/mock-data'
import type { PropertyWithTenant } from '@/lib/types/database'

export async function getProperties(ownerId: string): Promise<PropertyWithTenant[]> {
  if (MOCK_MODE) {
    return mockProperties.map((property) => ({
      ...property,
      tenant: mockTenants.find((tenant) => tenant.id === property.tenant_id) ?? null,
    }))
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  const { data, error } = await (await supabase)
    .from('properties')
    .select('*, tenant:tenants(*)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PropertyWithTenant[]
}
