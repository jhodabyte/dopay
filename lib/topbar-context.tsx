'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface TopbarConfig {
  title: string
  subtitle: string
  ctaLabel?: string
  onCtaClick?: () => void
  notificationCount?: number
}

interface TopbarContextValue {
  config: TopbarConfig
  setConfig: (config: TopbarConfig) => void
}

const defaultConfig: TopbarConfig = {
  title: 'Dashboard',
  subtitle: 'Bienvenido a Dopay',
}

const TopbarContext = createContext<TopbarContextValue>({
  config: defaultConfig,
  setConfig: () => undefined,
})

export function TopbarProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<TopbarConfig>(defaultConfig)

  const setConfig = useCallback((newConfig: TopbarConfig) => {
    setConfigState(newConfig)
  }, [])

  return (
    <TopbarContext.Provider value={{ config, setConfig }}>
      {children}
    </TopbarContext.Provider>
  )
}

export function useTopbar() {
  return useContext(TopbarContext)
}
