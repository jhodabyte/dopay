'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, Building2, Plus } from 'lucide-react'
import PropertyCard from '@/components/properties/PropertyCard'
import NewPropertyModal from '@/components/properties/NewPropertyModal'
import EditPropertyModal from '@/components/properties/EditPropertyModal'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { useTopbar } from '@/lib/topbar-context'
import type { PropertyWithTenant, Property } from '@/lib/types/database'

interface PropertiesClientProps {
  properties: PropertyWithTenant[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'vacant', label: 'Desocupadas' },
  { value: 'overdue', label: 'En mora' },
]

export default function PropertiesClient({ properties }: PropertiesClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setConfig } = useTopbar()

  const searchQuery = searchParams.get('q') ?? ''
  const statusFilter = searchParams.get('status') ?? ''
  const cityFilter = searchParams.get('city') ?? ''

  const [showNewModal, setShowNewModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const activeCount = properties.filter((p) => p.status === 'active').length

  useEffect(() => {
    setConfig({
      title: 'Propiedades',
      subtitle: `Gestiona tus ${activeCount} inmueble${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}`,
      ctaLabel: 'Nueva propiedad',
      onCtaClick: () => setShowNewModal(true),
    })
  }, [setConfig, activeCount])

  const uniqueCities = Array.from(new Set(properties.map((p) => p.city))).sort()
  const cityOptions = [
    { value: '', label: 'Todas las ciudades' },
    ...uniqueCities.map((city) => ({ value: city, label: city })),
  ]

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      !searchQuery ||
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || property.status === statusFilter
    const matchesCity = !cityFilter || property.city === cityFilter
    return matchesSearch && matchesStatus && matchesCity
  })

  const updateSearchParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  return (
    <>
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchQuery}
              onChange={(e) => updateSearchParam('q', e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-[#E5E7EB] rounded-[10px] text-sm outline-none focus:border-[#0062FF] bg-white transition-colors"
              style={{ color: 'var(--color-text)' }}
              data-testid="search-input"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => updateSearchParam('status', e.target.value)}
              name="filter-status"
            />
            <Select
              options={cityOptions}
              value={cityFilter}
              onChange={(e) => updateSearchParam('city', e.target.value)}
              name="filter-city"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                updateSearchParam('q', '')
                updateSearchParam('status', '')
                updateSearchParam('city', '')
              }}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              Filtrar
            </Button>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: '#EBF2FF' }}
            >
              <Building2 className="w-8 h-8" style={{ color: '#0062FF' }} />
            </div>
            <div className="text-center">
              <p
                className="text-base font-semibold mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                No encontramos propiedades
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {properties.length === 0
                  ? 'Registra tu primera propiedad para comenzar'
                  : 'Intenta ajustar los filtros de búsqueda'}
              </p>
            </div>
            {properties.length === 0 && (
              <Button variant="primary" onClick={() => setShowNewModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Nueva propiedad
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-4',
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            )}
            data-testid="property-grid"
          >
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onRegisterPayment={() => {}}
                onEdit={(prop) => setEditingProperty(prop)}
              />
            ))}
          </div>
        )}
      </div>

      <NewPropertyModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={() => router.refresh()}
      />

      <EditPropertyModal
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        onUpdated={() => { setEditingProperty(null); router.refresh() }}
        property={editingProperty}
      />
    </>
  )
}
