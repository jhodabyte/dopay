import { MOCK_MODE, mockProperties, mockTenants } from '@/lib/mock-data'
import type { PropertyWithTenant } from '@/lib/types/database'

export async function getProperties(): Promise<PropertyWithTenant[]> {
  if (MOCK_MODE) {
    return mockProperties.map((property) => ({
      ...property,
      tenant: mockTenants.find((tenant) => tenant.id === property.tenant_id) ?? null,
    }))
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('properties')
    .select('*, tenant:tenants(*)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProperties error:', error)
    return []
  }
  return (data ?? []) as PropertyWithTenant[]
}
