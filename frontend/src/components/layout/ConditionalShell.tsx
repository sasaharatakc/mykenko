'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

const NO_SHELL_PREFIXES = ['/admin', '/vendor']

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showShell = !NO_SHELL_PREFIXES.some((p) => pathname.startsWith(p))

  if (!showShell) return <>{children}</>

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
