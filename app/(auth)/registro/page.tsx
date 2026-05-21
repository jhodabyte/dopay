'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useRegistro } from './RegistroContext'
import { cn } from '@/lib/utils'

const step1Schema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
  phone: z.string().regex(/^\d{10}$/, 'Ingresa un número de 10 dígitos'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/\d/, 'La contraseña debe tener al menos un número'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
})

type Step1FormValues = z.infer<typeof step1Schema>

function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#10B981']
const strengthLabels = ['Débil', 'Regular', 'Buena', 'Fuerte']

export default function RegistroPaso1Page() {
  const router = useRouter()
  const { setStep1Data } = useRegistro()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
  })

  function onSubmit(values: Step1FormValues) {
    setStep1Data({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    })
    router.push('/registro/paso-2')
  }

  const strength = getPasswordStrength(passwordValue)

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 min-h-screen" style={{ backgroundColor: '#0062FF' }}>
        <div>
          <span className="text-white font-bold text-2xl">Dopay</span>
        </div>

        <div className="flex flex-col gap-8 max-w-[480px]">
          <h1 className="text-white font-bold leading-tight" style={{ fontSize: '36px' }}>
            Únete a +1.000 propietarios que ya organizan sus arriendos.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px' }}>
            Prueba 14 días gratis, sin tarjeta de crédito. Cancela cuando quieras.
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

          <div className="p-4" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
            <p className="text-white italic mb-3" style={{ fontSize: '14px' }}>
              "Dopay me cambió la vida. Antes perdía horas en hojas de cálculo. Ahora todo está en un solo lugar."
            </p>
            <p className="text-white" style={{ fontSize: '14px' }}>
              — María García, Propietaria en Chapinero
            </p>
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
              Paso 1 de 3
            </span>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-1" style={{ fontSize: '22px', color: '#1A1A1A' }}>
              Crea tu cuenta
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>
              Empieza gratis, sin tarjeta de crédito
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="firstName" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Juan"
                  {...register('firstName')}
                  className={cn(
                    'h-11 px-3 border rounded-[10px] text-sm outline-none transition-colors',
                    'focus:border-[#0062FF]',
                    errors.firstName ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  )}
                  style={{ color: '#1A1A1A' }}
                />
                {errors.firstName && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{errors.firstName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="lastName" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="García"
                  {...register('lastName')}
                  className={cn(
                    'h-11 px-3 border rounded-[10px] text-sm outline-none transition-colors',
                    'focus:border-[#0062FF]',
                    errors.lastName ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  )}
                  style={{ color: '#1A1A1A' }}
                />
                {errors.lastName && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                {...register('email')}
                className={cn(
                  'h-11 px-3 border rounded-[10px] text-sm outline-none transition-colors',
                  'focus:border-[#0062FF]',
                  errors.email ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                )}
                style={{ color: '#1A1A1A' }}
              />
              {errors.email && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                Teléfono
              </label>
              <div className="flex">
                <span
                  className="flex items-center px-3 text-sm border border-r-0 rounded-l-[10px]"
                  style={{ backgroundColor: '#F3F4F6', color: '#4B5563', borderColor: '#E5E7EB' }}
                >
                  +57
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="3001234567"
                  {...register('phone')}
                  className={cn(
                    'flex-1 h-11 px-3 border rounded-r-[10px] text-sm outline-none transition-colors',
                    'focus:border-[#0062FF]',
                    errors.phone ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  )}
                  style={{ color: '#1A1A1A' }}
                />
              </div>
              {errors.phone && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.phone.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres con un número"
                  {...register('password', {
                    onChange: (event) => setPasswordValue(event.target.value),
                  })}
                  className={cn(
                    'w-full h-11 px-3 pr-11 border rounded-[10px] text-sm outline-none transition-colors',
                    'focus:border-[#0062FF]',
                    errors.password ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  )}
                  style={{ color: '#1A1A1A' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passwordValue && (
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="flex-1 h-1 rounded-full transition-colors"
                      style={{
                        backgroundColor: index < strength ? strengthColors[strength - 1] : '#E5E7EB',
                      }}
                    />
                  ))}
                </div>
              )}
              {passwordValue && strength > 0 && (
                <p className="text-xs" style={{ color: strengthColors[strength - 1] }}>
                  Contraseña {strengthLabels[strength - 1]}
                </p>
              )}
              {errors.password && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('terms')}
                  className="w-4 h-4 mt-0.5 accent-[#0062FF]"
                />
                <span className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                  Acepto los{' '}
                  <a href="#" className="font-medium hover:underline" style={{ color: '#0062FF' }}>
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="#" className="font-medium hover:underline" style={{ color: '#0062FF' }}>
                    política de privacidad
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.terms.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full font-medium text-white transition-colors flex items-center justify-center gap-2 mt-2"
              style={{
                backgroundColor: isSubmitting ? '#4D94FF' : '#0062FF',
                borderRadius: '10px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Continuar
            </button>
          </form>

          <p className="text-center mt-5 text-sm" style={{ color: '#4B5563' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#0062FF' }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
