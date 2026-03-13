import { use, type ReactNode } from 'react'
import { getHydrationPromise } from './hydration'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  use(getHydrationPromise())
  return <>{children}</>
}
