'use client'

import { useRouter } from 'next/navigation'
import { MapPin, User, ImageIcon, Eye, CreditCard, Pencil, AlertCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn, formatCOP, getPropertyStatusLabel, calculateDaysOverdue } from '@/lib/utils'
import type { PropertyWithTenant, Property } from '@/lib/types/database'

interface PropertyCardProps {
  property: PropertyWithTenant
  onRegisterPayment: (property: PropertyWithTenant) => void
  onEdit: (property: Property) => void
}

function getStatusBadgeVariant(status: PropertyWithTenant['status']): 'active' | 'vacant' | 'inMora' {
  if (status === 'active') return 'active'
  if (status === 'overdue') return 'inMora'
  return 'vacant'
}

export default function PropertyCard({ property, onRegisterPayment, onEdit }: PropertyCardProps) {
  const router = useRouter()

  const daysOverdue = property.status === 'overdue'
    ? calculateDaysOverdue(property.contract_end)
    : 0

  function handleCardClick() {
    router.push(`/propiedades/${property.id}`)
  }

  function handleActionClick(event: React.MouseEvent, action: () => void) {
    event.stopPropagation()
    action()
  }

  return (
    <div
      className="bg-white rounded-[16px] overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      onClick={handleCardClick}
      data-testid="property-card"
    >
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <ImageIcon className="w-10 h-10" style={{ color: '#D1D5DB' }} />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <Badge variant={getStatusBadgeVariant(property.status)}>
            {getPropertyStatusLabel(property.status)}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <p
          className="font-semibold truncate mb-1"
          style={{ fontSize: '15px', color: 'var(--color-text)' }}
        >
          {property.name}
        </p>

        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <p
            className="text-sm truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {property.address}
          </p>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <p
            className={cn('text-sm truncate', !property.tenant && 'italic')}
            style={{ color: property.tenant ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
          >
            {property.tenant?.name ?? 'Sin arrendatario'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span
              className="font-semibold"
              style={{ fontSize: '15px', color: '#0062FF' }}
            >
              {formatCOP(property.monthly_rent)}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/mes</span>
          </div>

          {property.status === 'overdue' && daysOverdue > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
              <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
                {daysOverdue} días
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-1 px-4 py-3 border-t"
        style={{ borderColor: '#F3F4F6' }}
      >
        <button
          onClick={(e) => handleActionClick(e, () => router.push(`/propiedades/${property.id}`))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Ver detalle"
          aria-label="Ver detalle"
        >
          <Eye className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button
          onClick={(e) => handleActionClick(e, () => onRegisterPayment(property))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Registrar pago"
          aria-label="Registrar pago"
        >
          <CreditCard className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button
          onClick={(e) => handleActionClick(e, () => onEdit(property))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Editar"
          aria-label="Editar propiedad"
        >
          <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </div>
  )
}
