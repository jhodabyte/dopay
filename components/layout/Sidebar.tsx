'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Star,
  Settings,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Propiedades', href: '/propiedades', icon: Building2 },
  { label: 'Pagos', href: '/pagos', icon: CreditCard },
  { label: 'Planes', href: '/planes', icon: Star },
  { label: 'Configuración', href: '/ajustes', icon: Settings },
]

interface SidebarProps {
  onMobileClose?: () => void
  userFullName?: string
  userEmail?: string
}

export default function Sidebar({ onMobileClose, userFullName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userFullName
    ? userFullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <aside
      className="flex flex-col w-60 h-full bg-white border-r border-gray-100"
      style={{ minHeight: '100vh' }}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <span
          className="text-xl font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          Dopay
        </span>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors',
                isActive
                  ? 'text-[#0062FF] bg-[#EBF2FF]'
                  : 'hover:bg-[#F7F8FA]'
              )}
              style={!isActive ? { color: 'var(--color-text-secondary)' } : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-5 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-semibold shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--color-text)' }}
            >
              {userFullName ?? 'Usuario'}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {userEmail ?? ''}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
