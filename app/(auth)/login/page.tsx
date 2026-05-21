'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Users, Shield, Headphones } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setServerError('Correo o contraseña incorrectos. Intenta de nuevo.')
      return
    }
    router.push('/dashboard')
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 min-h-screen" style={{ backgroundColor: '#0062FF' }}>
        <div>
          <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            Dopay
          </span>
        </div>

        <div className="flex flex-col gap-8 max-w-[480px]">
          <h1 className="text-white font-bold leading-tight" style={{ fontSize: '40px' }}>
            Controla tus arriendos sin perder un solo pago.
          </h1>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
            Centraliza tus propiedades, configura recordatorios automáticos, genera reportes financieros y recibe soporte en tiempo real — todo desde un solo lugar.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Users className="text-white shrink-0" size={20} />
              <span className="text-white font-medium">+1.000 propietarios activos</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-white shrink-0" size={20} />
              <span className="text-white font-medium">99.9% uptime garantizado</span>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="text-white shrink-0" size={20} />
              <span className="text-white font-medium">Soporte en tiempo real</span>
            </div>
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
          <div className="mb-8">
            <h2 className="font-bold mb-1" style={{ fontSize: '24px', color: '#1A1A1A' }}>
              Bienvenido de vuelta
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>Ingresa a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
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
                  'h-12 px-4 border rounded-[10px] text-sm outline-none transition-colors',
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
              <label htmlFor="password" className="text-sm font-medium" style={{ color: '#4B5563' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...register('password')}
                  className={cn(
                    'w-full h-12 px-4 pr-12 border rounded-[10px] text-sm outline-none transition-colors',
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: '#EF4444' }}>{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded accent-[#0062FF]"
                />
                <span className="text-sm" style={{ color: '#4B5563' }}>Recordarme</span>
              </label>
              <Link
                href="/recuperar-contrasena"
                className="text-sm font-medium hover:underline"
                style={{ color: '#0062FF' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {serverError && (
              <p className="text-sm text-center" style={{ color: '#EF4444' }}>{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full font-medium text-white transition-colors flex items-center justify-center gap-2"
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
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>o continúa con</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="h-12 w-full font-medium flex items-center justify-center gap-3 border transition-colors hover:bg-gray-50"
              style={{
                borderColor: '#E5E7EB',
                borderRadius: '10px',
                color: '#1A1A1A',
                backgroundColor: '#FFFFFF',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8063.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5836-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853" />
                <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.173 0 7.5482 0 9s.3477 2.827.9573 4.0418L3.964 10.71z" fill="#FBBC05" />
                <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#4B5563' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-medium hover:underline" style={{ color: '#0062FF' }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
