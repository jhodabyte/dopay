'use client'

import { useState, useEffect } from 'react'
import { Check, Search } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { MOCK_MODE, mockTenants } from '@/lib/mock-data'
import type { Tenant } from '@/lib/types/database'

interface AssignTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onAssigned: () => void
  propertyId: string
}

type ActiveTab = 'existing' | 'new'

interface NewTenantForm {
  fullName: string
  email: string
  phone: string
}

interface NewTenantFormErrors {
  fullName?: string
  email?: string
  phone?: string
}

const EMPTY_NEW_TENANT_FORM: NewTenantForm = {
  fullName: '',
  email: '',
  phone: '',
}

function getInitialsFromName(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function isValidEmail(emailValue: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
}

function isValidPhone(phoneValue: string): boolean {
  return /^\d{10}$/.test(phoneValue)
}

export default function AssignTenantModal({
  isOpen,
  onClose,
  onAssigned,
  propertyId,
}: AssignTenantModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('existing')
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [newTenantForm, setNewTenantForm] = useState<NewTenantForm>(EMPTY_NEW_TENANT_FORM)
  const [newTenantErrors, setNewTenantErrors] = useState<NewTenantFormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    async function fetchTenants() {
      setLoadingTenants(true)
      try {
        if (MOCK_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          setTenantsList(mockTenants)
        } else {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return
          const { data } = await supabase
            .from('tenants')
            .select('*')
            .eq('owner_id', user.id)
            .order('name')
          setTenantsList(data ?? [])
        }
      } finally {
        setLoadingTenants(false)
      }
    }

    fetchTenants()
  }, [isOpen])

  function handleClose() {
    setActiveTab('existing')
    setSearchQuery('')
    setSelectedTenantId(null)
    setNewTenantForm(EMPTY_NEW_TENANT_FORM)
    setNewTenantErrors({})
    onClose()
  }

  function handleNewTenantChange(field: keyof NewTenantForm, value: string) {
    setNewTenantForm((prev) => ({ ...prev, [field]: value }))
    if (newTenantErrors[field]) {
      setNewTenantErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validateNewTenantForm(): boolean {
    const errors: NewTenantFormErrors = {}
    if (!newTenantForm.fullName.trim()) {
      errors.fullName = 'El nombre es requerido'
    }
    if (!newTenantForm.email.trim()) {
      errors.email = 'El correo es requerido'
    } else if (!isValidEmail(newTenantForm.email)) {
      errors.email = 'Ingresa un correo válido'
    }
    if (!newTenantForm.phone.trim()) {
      errors.phone = 'El teléfono es requerido'
    } else if (!isValidPhone(newTenantForm.phone)) {
      errors.phone = 'El teléfono debe tener 10 dígitos'
    }
    setNewTenantErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleAssignExisting() {
    if (!selectedTenantId) return
    setSaving(true)
    try {
      if (MOCK_MODE) {
        console.log('Mock: assign tenant', { propertyId, tenantId: selectedTenantId })
        await new Promise((resolve) => setTimeout(resolve, 400))
      } else {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')
        await supabase
          .from('properties')
          .update({ tenant_id: selectedTenantId, status: 'active' })
          .eq('id', propertyId)
          .eq('owner_id', user.id)
      }
      onAssigned()
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateAndAssign() {
    if (!validateNewTenantForm()) return
    setSaving(true)
    try {
      if (MOCK_MODE) {
        console.log('Mock: assign tenant', {
          propertyId,
          tenantId: 'new-tenant-mock',
        })
        await new Promise((resolve) => setTimeout(resolve, 400))
      } else {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')
        const { data: newTenant, error: insertError } = await supabase
          .from('tenants')
          .insert({
            owner_id: user.id,
            name: newTenantForm.fullName,
            email: newTenantForm.email,
            phone: newTenantForm.phone,
          })
          .select('id')
          .single()
        if (insertError || !newTenant) throw new Error('Error al crear arrendatario')
        await supabase
          .from('properties')
          .update({ tenant_id: newTenant.id, status: 'active' })
          .eq('id', propertyId)
          .eq('owner_id', user.id)
      }
      onAssigned()
    } finally {
      setSaving(false)
    }
  }

  const filteredTenants = tenantsList.filter((tenant) => {
    const query = searchQuery.toLowerCase()
    return (
      tenant.name.toLowerCase().includes(query) ||
      tenant.email.toLowerCase().includes(query)
    )
  })

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Asignar arrendatario" size="md">
      <div className="flex flex-col gap-5">
        <div
          className="flex gap-2 p-1 rounded-[10px]"
          style={{ backgroundColor: '#F7F8FA' }}
        >
          <button
            type="button"
            className="flex-1 py-2 px-3 text-sm font-medium rounded-[8px] transition-colors"
            style={
              activeTab === 'existing'
                ? { backgroundColor: '#EBF2FF', color: '#0062FF' }
                : { backgroundColor: 'transparent', color: '#4B5563' }
            }
            onClick={() => setActiveTab('existing')}
          >
            Arrendatario existente
          </button>
          <button
            type="button"
            className="flex-1 py-2 px-3 text-sm font-medium rounded-[8px] transition-colors"
            style={
              activeTab === 'new'
                ? { backgroundColor: '#EBF2FF', color: '#0062FF' }
                : { backgroundColor: 'transparent', color: '#4B5563' }
            }
            onClick={() => setActiveTab('new')}
          >
            Nuevo arrendatario
          </button>
        </div>

        {activeTab === 'existing' && (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: '#9CA3AF' }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre o correo…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full h-10 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#0062FF] transition-colors"
                style={{ color: '#1A1A1A' }}
              />
            </div>

            {loadingTenants ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  Cargando arrendatarios…
                </p>
              </div>
            ) : filteredTenants.length === 0 && tenantsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <p className="text-sm text-center" style={{ color: '#4B5563' }}>
                  No tienes arrendatarios registrados
                </p>
                <button
                  type="button"
                  className="text-sm font-medium"
                  style={{ color: '#0062FF' }}
                  onClick={() => setActiveTab('new')}
                >
                  Crear nuevo arrendatario
                </button>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  Sin resultados para "{searchQuery}"
                </p>
              </div>
            ) : (
              <div
                className="flex flex-col gap-2 overflow-y-auto"
                style={{ maxHeight: '260px' }}
              >
                {filteredTenants.map((tenant) => {
                  const isSelected = selectedTenantId === tenant.id
                  return (
                    <button
                      key={tenant.id}
                      type="button"
                      className="flex items-center gap-3 border rounded-[12px] p-3 cursor-pointer transition-colors text-left w-full"
                      style={{
                        borderColor: isSelected ? '#0062FF' : '#E5E7EB',
                        backgroundColor: isSelected ? '#EBF2FF' : '#FFFFFF',
                      }}
                      onClick={() => setSelectedTenantId(tenant.id)}
                    >
                      <div
                        className="w-9 h-9 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#0062FF' }}
                      >
                        {getInitialsFromName(tenant.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: '#1A1A1A' }}
                        >
                          {tenant.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#4B5563' }}>
                          {tenant.email}
                        </p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          {tenant.phone}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: '#0062FF' }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="secondary" onClick={handleClose} disabled={saving}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignExisting}
                loading={saving}
                disabled={!selectedTenantId || saving}
              >
                Asignar
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre completo"
              placeholder="Ej: María García López"
              value={newTenantForm.fullName}
              onChange={(event) => handleNewTenantChange('fullName', event.target.value)}
              error={newTenantErrors.fullName}
              required
              name="new-tenant-name"
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="Ej: maria.garcia@email.com"
              value={newTenantForm.email}
              onChange={(event) => handleNewTenantChange('email', event.target.value)}
              error={newTenantErrors.email}
              required
              name="new-tenant-email"
            />
            <Input
              label="Teléfono"
              placeholder="Ej: 3101234567"
              value={newTenantForm.phone}
              onChange={(event) => handleNewTenantChange('phone', event.target.value)}
              error={newTenantErrors.phone}
              required
              name="new-tenant-phone"
            />

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="secondary" onClick={handleClose} disabled={saving}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateAndAssign}
                loading={saving}
              >
                Crear y asignar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
