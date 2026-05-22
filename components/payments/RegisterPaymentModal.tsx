'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { Property, PaymentConcept, PaymentMethod } from '@/lib/types'

interface RegisterPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  properties: Property[]
  defaultPropertyId?: string
  onSuccess?: () => void
}

interface FormState {
  propertyId: string
  concept: PaymentConcept | ''
  amountRaw: string
  method: PaymentMethod | ''
  notes: string
  notifyTenant: boolean
}

interface FormErrors {
  propertyId?: string
  concept?: string
  amountRaw?: string
  method?: string
}

const CONCEPT_OPTIONS = [
  { value: 'rent', label: 'Arriendo' },
  { value: 'admin', label: 'Administración' },
  { value: 'utilities', label: 'Servicios' },
  { value: 'other', label: 'Otro' },
]

const METHOD_OPTIONS = [
  { value: 'transfer', label: 'Transferencia bancaria' },
  { value: 'pse', label: 'PSE' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
]

function formatAmountDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('es-CO')
}

export default function RegisterPaymentModal({
  isOpen,
  onClose,
  properties,
  defaultPropertyId,
  onSuccess,
}: RegisterPaymentModalProps) {
  const [form, setForm] = useState<FormState>({
    propertyId: defaultPropertyId ?? '',
    concept: '',
    amountRaw: '',
    method: '',
    notes: '',
    notifyTenant: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({
        propertyId: defaultPropertyId ?? '',
        concept: '',
        amountRaw: '',
        method: '',
        notes: '',
        notifyTenant: true,
      })
      setErrors({})
    }
  }, [isOpen, defaultPropertyId])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value.replace(/\D/g, '')
    setForm((prev) => ({ ...prev, amountRaw: raw }))
    if (errors.amountRaw) setErrors((prev) => ({ ...prev, amountRaw: undefined }))
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.propertyId) newErrors.propertyId = 'Selecciona una propiedad'
    if (!form.concept) newErrors.concept = 'Selecciona un concepto'
    if (!form.amountRaw || Number(form.amountRaw) <= 0) newErrors.amountRaw = 'Ingresa un monto válido'
    if (!form.method) newErrors.method = 'Selecciona un método de pago'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
        await new Promise((resolve) => setTimeout(resolve, 600))
        console.log('Mock: pago registrado', {
          propertyId: form.propertyId,
          concept: form.concept,
          amount: Number(form.amountRaw),
          method: form.method,
          notes: form.notes,
        })
      } else {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')
        const selectedProperty = properties.find((p) => p.id === form.propertyId)
        const { error } = await supabase.from('payments').insert({
          property_id: form.propertyId,
          tenant_id: selectedProperty?.tenant_id ?? null,
          concept: form.concept,
          amount: Number(form.amountRaw),
          due_date: new Date().toISOString().split('T')[0],
          paid_date: new Date().toISOString().split('T')[0],
          method: form.method || null,
          status: 'paid',
          notes: form.notes || null,
        })
        if (error) throw error
      }
      onSuccess?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const propertyOptions = properties.map((p) => ({ value: p.id, label: p.name }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rp-modal-title"
        className="relative w-full bg-white shadow-xl overflow-hidden"
        style={{ maxWidth: '560px', borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5 relative">
          <div>
            <h2
              id="rp-modal-title"
              className="text-xl"
              style={{ fontWeight: 700, color: '#1A1A1A' }}
            >
              Registrar pago
            </h2>
            <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
              Registra el pago recibido de tus arrendatarios
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-gray-200"
            style={{ backgroundColor: '#F7F8FA' }}
            aria-label="Cerrar modal"
            data-testid="modal-close-btn"
          >
            <X className="w-4 h-4" style={{ color: '#4B5563' }} />
          </button>
        </div>

        <div className="px-6 flex flex-col gap-4 pb-4">
          <div id="rpProp">
            <Select
              label="Propiedad"
              name="propertyId"
              options={propertyOptions}
              value={form.propertyId}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, propertyId: e.target.value }))
                if (errors.propertyId) setErrors((prev) => ({ ...prev, propertyId: undefined }))
              }}
              placeholder="Selecciona una propiedad"
              error={errors.propertyId}
            />
          </div>

          <div id="rpConceptRow">
            <Select
              label="Concepto"
              name="concept"
              options={CONCEPT_OPTIONS}
              value={form.concept}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, concept: e.target.value as PaymentConcept }))
                if (errors.concept) setErrors((prev) => ({ ...prev, concept: undefined }))
              }}
              placeholder="Selecciona un concepto"
              error={errors.concept}
            />
          </div>

          <div id="rpAmountRow">
            <label
              htmlFor="rp-amount"
              className="text-sm font-medium mb-2 block"
              style={{ color: '#4B5563' }}
            >
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                style={{ color: '#4B5563' }}
              >
                $
              </span>
              <input
                id="rp-amount"
                type="text"
                inputMode="numeric"
                value={formatAmountDisplay(form.amountRaw)}
                onChange={handleAmountChange}
                placeholder="0"
                className={cn(
                  'w-full h-10 pl-7 pr-3 border rounded-lg text-sm transition-colors outline-none focus:border-[#0062FF]',
                  errors.amountRaw ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                )}
                style={{ color: '#1A1A1A' }}
                data-testid="rp-amount-input"
              />
            </div>
            {errors.amountRaw && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                {errors.amountRaw}
              </p>
            )}
          </div>

          <div id="rpMethod">
            <Select
              label="Método de pago"
              name="method"
              options={METHOD_OPTIONS}
              value={form.method}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, method: e.target.value as PaymentMethod }))
                if (errors.method) setErrors((prev) => ({ ...prev, method: undefined }))
              }}
              placeholder="Selecciona un método"
              error={errors.method}
            />
          </div>

          <div id="rpNotes">
            <label
              htmlFor="rp-notes"
              className="text-sm font-medium mb-2 block"
              style={{ color: '#4B5563' }}
            >
              Notas
            </label>
            <textarea
              id="rp-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Referencia o número de transacción"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm transition-colors outline-none focus:border-[#0062FF] resize-none"
              style={{ color: '#1A1A1A' }}
            />
          </div>

          <div id="rpNotify" className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                Notificar arrendatario
              </p>
              {form.notifyTenant && (
                <p className="text-xs mt-0.5" style={{ color: '#10B981' }}>
                  Se enviará un email al arrendatario
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.notifyTenant}
              onClick={() => setForm((prev) => ({ ...prev, notifyTenant: !prev.notifyTenant }))}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0062FF]',
                form.notifyTenant ? 'bg-[#0062FF]' : 'bg-gray-200'
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

        <div
          className="flex items-center justify-end gap-3 px-6 py-5 border-t"
          style={{ backgroundColor: '#F7F8FA', borderColor: '#E5E7EB' }}
          id="rpActions"
        >
          <Button variant="secondary" onClick={onClose} disabled={saving} data-testid="modal-cancel-btn">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} data-testid="modal-save-btn">
            Guardar pago
          </Button>
        </div>
      </div>
    </div>
  )
}
