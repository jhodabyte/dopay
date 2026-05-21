'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { MOCK_MODE } from '@/lib/mock-data'
import type { Property, PropertyType } from '@/lib/types/database'

interface EditPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  property: Property | null
}

interface FormState {
  name: string
  address: string
  city: string
  type: PropertyType | ''
  monthly_rent: string
  contract_start: string
  contract_end: string
}

interface FormErrors {
  name?: string
  address?: string
  city?: string
  type?: string
  monthly_rent?: string
}

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Local comercial' },
  { value: 'warehouse', label: 'Bodega' },
]

export default function EditPropertyModal({ isOpen, onClose, onUpdated, property }: EditPropertyModalProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    city: '',
    type: '',
    monthly_rent: '',
    contract_start: '',
    contract_end: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (property) {
      setForm({
        name: property.name,
        address: property.address,
        city: property.city,
        type: property.type,
        monthly_rent: String(property.monthly_rent),
        contract_start: property.contract_start ?? '',
        contract_end: property.contract_end ?? '',
      })
      setErrors({})
    }
  }, [property])

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!form.address.trim()) newErrors.address = 'La dirección es requerida'
    if (!form.city.trim()) newErrors.city = 'La ciudad es requerida'
    if (!form.type) newErrors.type = 'El tipo es requerido'
    if (!form.monthly_rent || Number(form.monthly_rent) <= 0)
      newErrors.monthly_rent = 'El valor del arriendo es requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!property || !validate()) return
    setSaving(true)
    try {
      if (MOCK_MODE) {
        console.log('Mock mode: edit property', property.id, form)
        await new Promise((resolve) => setTimeout(resolve, 400))
      } else {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase
          .from('properties')
          .update({
            name: form.name,
            address: form.address,
            city: form.city,
            type: form.type,
            monthly_rent: Number(form.monthly_rent),
            contract_start: form.contract_start || null,
            contract_end: form.contract_end || null,
          })
          .eq('id', property.id)
      }
      onUpdated()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar propiedad" size="lg">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre / Alias"
            placeholder="Ej: Apto 502 · Chapinero"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            name="edit-property-name"
          />
          <Input
            label="Ciudad"
            placeholder="Ej: Bogotá"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={errors.city}
            required
            name="edit-property-city"
          />
        </div>

        <Input
          label="Dirección completa"
          placeholder="Ej: Calle 67 # 5-83, Apto 302"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          error={errors.address}
          required
          name="edit-property-address"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Tipo de inmueble"
            options={PROPERTY_TYPE_OPTIONS}
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            error={errors.type}
            placeholder="Selecciona un tipo"
            name="edit-property-type"
          />

          <div className="flex flex-col">
            <label
              htmlFor="edit-property-rent"
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Valor mensual del arriendo (COP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                $
              </span>
              <input
                id="edit-property-rent"
                type="number"
                min="0"
                value={form.monthly_rent}
                onChange={(e) => handleChange('monthly_rent', e.target.value)}
                placeholder="1.800.000"
                className="h-10 pl-7 pr-3 border rounded-lg text-sm transition-colors outline-none focus:border-[#0062FF] w-full"
                style={{
                  borderColor: errors.monthly_rent ? '#EF4444' : '#E5E7EB',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            {errors.monthly_rent && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                {errors.monthly_rent}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha de inicio del contrato"
            type="date"
            value={form.contract_start}
            onChange={(e) => handleChange('contract_start', e.target.value)}
            name="edit-property-contract-start"
          />
          <Input
            label="Fecha de fin del contrato"
            type="date"
            value={form.contract_end}
            onChange={(e) => handleChange('contract_end', e.target.value)}
            name="edit-property-contract-end"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </Modal>
  )
}
