import { createContext } from 'react'
import type Keycloak from 'keycloak-js'
import keycloak from './keycloak'

export interface AuthContextType {
  keycloak: Keycloak
  authenticated: boolean
  initialized: boolean
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  keycloak,
  authenticated: false,
  initialized: false,
  logout: () => {},
})
