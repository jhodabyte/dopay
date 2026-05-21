'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { TopbarProvider, useTopbar } from '@/lib/topbar-context'

interface AppShellProps {
  children: React.ReactNode
  userFullName?: string
  userEmail?: string
}

function AppShellInner({ children, userFullName, userEmail }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { config } = useTopbar()

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex md:shrink-0">
        <Sidebar userFullName={userFullName} userEmail={userEmail} />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          onMobileClose={() => setMobileOpen(false)}
          userFullName={userFullName}
          userEmail={userEmail}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={config.title}
          subtitle={config.subtitle}
          ctaLabel={config.ctaLabel}
          onCtaClick={config.onCtaClick}
          notificationCount={config.notificationCount}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppShell({ children, userFullName, userEmail }: AppShellProps) {
  return (
    <TopbarProvider>
      <AppShellInner userFullName={userFullName} userEmail={userEmail}>
        {children}
      </AppShellInner>
    </TopbarProvider>
  )
}
