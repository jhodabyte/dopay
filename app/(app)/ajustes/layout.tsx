'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, User, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

const SETTINGS_NAV: SettingsNavItem[] = [
  { label: 'Notificaciones', href: '/ajustes/notificaciones', icon: Bell },
  { label: 'Perfil', href: '/ajustes/perfil', icon: User },
  { label: 'Facturación', href: '/ajustes/facturacion', icon: CreditCard },
]

export default function AjustesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
          Configuración
        </h1>
        <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
          Ajusta tus preferencias y notificaciones
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <nav
          className="bg-white rounded-2xl border border-gray-100 p-3 shrink-0 w-full md:w-[220px]"
          aria-label="Navegación de configuración"
          data-testid="settings-nav"
        >
          {SETTINGS_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
                  isActive
                    ? 'text-[#0062FF] bg-[#EBF2FF]'
                    : 'hover:bg-[#F7F8FA]'
                )}
                style={!isActive ? { color: '#4B5563' } : undefined}
              >
                <item.icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? '#0062FF' : '#9CA3AF' }}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 min-w-0 w-full">{children}</div>
      </div>
    </div>
  )
}
