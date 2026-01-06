import { createContext } from 'react'
import Keycloak from 'keycloak-js'
import type { AuthUser } from '@/types/user'

export interface AuthContextType {
  keycloak: Keycloak
  authenticated: boolean
  initialized: boolean
  logout: () => void
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextType>({
  keycloak: {} as Keycloak,
  authenticated: false,
  initialized: false,
  logout: () => {},
  user: null,
})
