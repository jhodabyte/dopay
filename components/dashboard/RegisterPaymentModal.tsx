'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { MOCK_MODE, mockProperties } from '@/lib/mock-data'
import type { Property } from '@/lib/types/database'

interface RegisterPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  defaultPropertyId?: string
  properties?: Property[]
}

interface PaymentFormState {
  propertyId: string
  concept: string
  amount: string
  method: string
  notes: string
  notifyTenant: boolean
}

const emptyForm: PaymentFormState = {
  propertyId: '',
  concept: '',
  amount: '',
  method: '',
  notes: '',
  notifyTenant: true,
}

const CONCEPT_OPTIONS = [
  { value: 'rent', label: 'Arriendo' },
  { value: 'admin', label: 'Administración' },
  { value: 'utilities', label: 'Servicios' },
  { value: 'other', label: 'Otro' },
]

const METHOD_OPTIONS = [
  { value: 'transfer', label: 'Transferencia' },
  { value: 'pse', label: 'PSE' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
]

function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('es-CO').format(Number(digits))
}

export default function RegisterPaymentModal({
  isOpen,
  onClose,
  defaultPropertyId,
  properties,
}: RegisterPaymentModalProps) {
  const availableProperties = properties ?? (MOCK_MODE ? mockProperties : [])

  const propertyOptions = availableProperties.map((property) => ({
    value: property.id,
    label: property.name,
  }))

  const [form, setForm] = useState<PaymentFormState>({
    ...emptyForm,
    propertyId: defaultPropertyId ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormState, string>>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, propertyId: defaultPropertyId ?? '' })
      setErrors({})
    }
  }, [isOpen, defaultPropertyId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function validate(): boolean {
    const newErrors: Partial<Record<keyof PaymentFormState, string>> = {}
    if (!form.propertyId) newErrors.propertyId = 'Selecciona una propiedad'
    if (!form.concept) newErrors.concept = 'Selecciona un concepto'
    if (!form.amount) newErrors.amount = 'Ingresa el monto'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const rawAmount = Number(form.amount.replace(/\D/g, ''))

    if (MOCK_MODE) {
      console.log('[MOCK] Registrar pago:', {
        propertyId: form.propertyId,
        concept: form.concept,
        amount: rawAmount,
        method: form.method || null,
        notes: form.notes || null,
        notifyTenant: form.notifyTenant,
      })
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSaving(false)
      onClose()
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const property = availableProperties.find((p) => p.id === form.propertyId)

      await supabase.from('payments').insert({
        property_id: form.propertyId,
        tenant_id: property?.tenant_id ?? '',
        concept: form.concept,
        amount: rawAmount,
        due_date: new Date().toISOString().split('T')[0],
        paid_date: new Date().toISOString().split('T')[0],
        method: form.method || null,
        status: 'paid',
        notes: form.notes || null,
      })

      onClose()
    } catch (error) {
      console.error('Error registrando pago:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-payment-title"
        className="relative w-full bg-white rounded-[20px] shadow-xl"
        style={{ maxWidth: '560px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2
            id="register-payment-title"
            className="text-lg font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            Registrar pago
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
            style={{ backgroundColor: '#F7F8FA' }}
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Select
            label="Propiedad"
            name="propertyId"
            options={propertyOptions}
            value={form.propertyId}
            placeholder="Selecciona una propiedad"
            onChange={(event) => setForm((prev) => ({ ...prev, propertyId: event.target.value }))}
            error={errors.propertyId}
          />

          <Select
            label="Concepto"
            name="concept"
            options={CONCEPT_OPTIONS}
            value={form.concept}
            placeholder="Selecciona un concepto"
            onChange={(event) => setForm((prev) => ({ ...prev, concept: event.target.value }))}
            error={errors.concept}
          />

          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Monto
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
                style={{ color: 'var(--color-text-muted)' }}
              >
                $
              </span>
              <input
                id="amount"
                name="amount"
                type="text"
                inputMode="numeric"
                value={form.amount}
                placeholder="0"
                onChange={(event) => {
                  const formatted = formatAmountInput(event.target.value)
                  setForm((prev) => ({ ...prev, amount: formatted }))
                }}
                className={cn(
                  'h-10 pl-7 pr-3 border rounded-lg text-sm transition-colors outline-none w-full',
                  'focus:border-[#0062FF]',
                  errors.amount ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                )}
                style={{ color: 'var(--color-text)' }}
              />
            </div>
            {errors.amount && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                {errors.amount}
              </p>
            )}
          </div>

          <Select
            label="Método de pago"
            name="method"
            options={METHOD_OPTIONS}
            value={form.method}
            placeholder="Selecciona un método"
            onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
          />

          <div className="flex flex-col">
            <label
              htmlFor="notes"
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              placeholder="Referencia o número de transacción"
              rows={3}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm transition-colors outline-none resize-none focus:border-[#0062FF]"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Notificar al arrendatario
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.notifyTenant}
              onClick={() => setForm((prev) => ({ ...prev, notifyTenant: !prev.notifyTenant }))}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0062FF]',
                form.notifyTenant ? 'bg-[#0062FF]' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  form.notifyTenant ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Guardar pago
          </Button>
        </div>
      </div>
    </div>
  )
}
