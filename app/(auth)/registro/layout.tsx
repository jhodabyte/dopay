import { RegistroProvider } from './RegistroContext'

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <RegistroProvider>{children}</RegistroProvider>
}
