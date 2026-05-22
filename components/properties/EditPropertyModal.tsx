'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [imageDragOver, setImageDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (property && isOpen) {
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
      setImageFile(null)
      setImagePreview(null)
      setRemoveExistingImage(false)
    }
  }, [property, isOpen])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setRemoveExistingImage(false)
  }

  function handleFileDrop(event: React.DragEvent) {
    event.preventDefault()
    setImageDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    setRemoveExistingImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  async function uploadImageToStorage(file: File, propertyId: string, userId: string): Promise<string> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const extension = file.name.split('.').pop() ?? 'jpg'
    const filePath = `${userId}/${propertyId}-${Date.now()}.${extension}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(uploadData.path)
    return publicUrl
  }

  async function handleSave() {
    if (!property || !validate()) return
    setSaving(true)
    try {
      if (MOCK_MODE) {
        console.log('Mock mode: edit property', property.id, form, { imageFile: imageFile?.name })
        await new Promise((resolve) => setTimeout(resolve, 400))
      } else {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')

        let imageUrl: string | null | undefined = undefined

        if (imageFile) {
          imageUrl = await uploadImageToStorage(imageFile, property.id, user.id)
        } else if (removeExistingImage) {
          imageUrl = null
        }

        const updatePayload: Record<string, unknown> = {
          name: form.name,
          address: form.address,
          city: form.city,
          type: form.type,
          monthly_rent: Number(form.monthly_rent),
          contract_start: form.contract_start || null,
          contract_end: form.contract_end || null,
        }

        if (imageUrl !== undefined) {
          updatePayload.image_url = imageUrl
        }

        await supabase
          .from('properties')
          .update(updatePayload)
          .eq('id', property.id)
      }
      onUpdated()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const currentImageUrl = property?.image_url
  const displayImageSrc = imagePreview ?? (removeExistingImage ? null : currentImageUrl)
  const hasImage = !!displayImageSrc

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
                name="edit-property-rent"
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

        <div className="flex flex-col">
          <label
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Foto del inmueble
          </label>

          {hasImage ? (
            <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB]" style={{ aspectRatio: '16/7' }}>
              <img
                src={displayImageSrc}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full shadow-md transition-colors hover:bg-red-100"
                style={{ backgroundColor: 'white' }}
                aria-label="Quitar imagen"
              >
                <X className="w-4 h-4" style={{ color: '#EF4444' }} />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-6"
              style={{
                borderColor: imageDragOver ? '#0062FF' : '#E5E7EB',
                backgroundColor: imageDragOver ? 'rgba(0,98,255,0.04)' : '#F7F8FA',
              }}
              onDragOver={(e) => { e.preventDefault(); setImageDragOver(true) }}
              onDragLeave={() => setImageDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Arrastra una imagen o{' '}
                <span style={{ color: '#0062FF' }}>selecciona un archivo</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                JPG, PNG o WEBP
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
          />

          {imageFile && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Nueva imagen seleccionada: {imageFile.name}
            </p>
          )}
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
