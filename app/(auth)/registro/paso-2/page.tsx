'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { useRegistro } from '../RegistroContext'
import { cn } from '@/lib/utils'

const step2Schema = z.object({
  propertyCount: z.string().min(1, 'Selecciona cuántas propiedades tienes'),
  cities: z.string().min(1, 'Ingresa al menos una ciudad'),
  currentManagement: z.string().min(1, 'Selecciona cómo gestionas tus arriendos'),
})

type Step2FormValues = z.infer<typeof step2Schema>

const propertyCountOptions = [
  { value: '1', label: '1 propiedad' },
  { value: '2-5', label: '2 a 5 propiedades' },
  { value: '6-10', label: '6 a 10 propiedades' },
  { value: '11-20', label: '11 a 20 propiedades' },
  { value: '20+', label: 'Más de 20' },
]

const managementOptions = [
  'En papel o cuaderno',
  'Hojas de cálculo (Excel, Sheets)',
  'Otra aplicación',
  'No tengo un sistema definido',
]

export default function RegistroPaso2Page() {
  const router = useRouter()
  const { formData, setStep2Data } = useRegistro()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      propertyCount: formData.step2.propertyCount,
      cities: formData.step2.cities,
      currentManagement: formData.step2.currentManagement,
    },
  })

  function onSubmit(values: Step2FormValues) {
    setStep2Data(values)
    router.push('/registro/paso-3')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 min-h-screen" style={{ backgroundColor: '#0062FF' }}>
        <div>
          <span className="text-white font-bold text-2xl">Dopay</span>
        </div>

        <div className="flex flex-col gap-8 max-w-[480px]">
          <h1 className="text-white font-bold leading-tight" style={{ fontSize: '36px' }}>
            Ayúdanos a personalizar tu experiencia.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px' }}>
            Con esta información adaptamos Dopay a tus necesidades específicas como propietario.
          </p>

          <div className="flex flex-col gap-4">
            {[
              'Control total de tus pagos de arriendo',
              'Recordatorios automáticos para tus inquilinos',
              'Reportes financieros en tiempo real',
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="text-white shrink-0 mt-0.5" size={18} />
                <span className="text-white" style={{ fontSize: '15px' }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div />
      </div>

      {/* Right panel */}
      <div
        className="flex w-full md:w-1/2 items-center justify-center p-6 md:p-12"
        style={{ backgroundColor: '#F7F8FA' }}
      >
        <div
          className="w-full max-w-[420px] bg-white p-10 shadow-sm"
          style={{ borderRadius: '16px' }}
        >
          <div className="flex justify-start mb-6">
            <span
              className="text-sm font-medium text-white px-4 py-1.5"
              style={{ backgroundColor: '#0062FF', borderRadius: '9999px' }}
            >
              Paso 2 de 3
            </span>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-1" style={{ fontSize: '22px', color: '#1A1A1A' }}>
              Cuéntanos sobre tus propiedades
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>
              Esta información nos ayuda a configurar tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="propertyCount" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                ¿Cuántas propiedades tienes en arriendo?
              </label>
              <select
                id="propertyCount"
                {...register('propertyCount')}
                className={cn(
                  'h-11 px-3 border rounded-[10px] text-sm outline-none transition-colors bg-white',
                  'focus:border-[#0062FF]',
                  errors.propertyCount ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                )}
                style={{ color: '#1A1A1A' }}
              >
                <option value="">Selecciona una opción</option>
                {propertyCountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.propertyCount && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.propertyCount.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="cities" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                ¿En qué ciudad(es) están tus propiedades?
              </label>
              <input
                id="cities"
                type="text"
                placeholder="Bogotá, Medellín, Cali..."
                {...register('cities')}
                className={cn(
                  'h-11 px-3 border rounded-[10px] text-sm outline-none transition-colors',
                  'focus:border-[#0062FF]',
                  errors.cities ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                )}
                style={{ color: '#1A1A1A' }}
              />
              {errors.cities && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.cities.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#4B5563' }}>
                ¿Cómo gestionas actualmente tus arriendos?
              </span>
              <div className="flex flex-col gap-2">
                {managementOptions.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value={option}
                      {...register('currentManagement')}
                      className="w-4 h-4 accent-[#0062FF]"
                    />
                    <span className="text-sm" style={{ color: '#1A1A1A' }}>{option}</span>
                  </label>
                ))}
              </div>
              {errors.currentManagement && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.currentManagement.message}</p>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => router.push('/registro')}
                className="flex-1 h-12 font-medium border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: '#E5E7EB',
                  borderRadius: '10px',
                  color: '#1A1A1A',
                  backgroundColor: '#FFFFFF',
                }}
              >
                Atrás
              </button>
              <button
                type="submit"
                className="flex-1 h-12 font-medium text-white transition-colors"
                style={{
                  backgroundColor: '#0062FF',
                  borderRadius: '10px',
                }}
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
