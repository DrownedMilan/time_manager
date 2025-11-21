import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import keycloak from './keycloak'
import { AuthContext } from './AuthContext'
import { UserContext } from '@/hooks/useUserContext'

import { api } from '@/services/api'
import type { AuthUser, User, UserRole } from '@/types'

import { logout } from './logout'

interface KeycloakProviderProps {
  children: ReactNode
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [user, setUser] = useState<User | null>(null) // <-- backend full user

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      })
      .then(async (auth) => {
        setAuthenticated(auth)
        setInitialized(true)

        if (!auth || !keycloak.token) return

        localStorage.setItem('kc_token', keycloak.token)

        // 1️⃣ Load Keycloak profile
        const profile = await keycloak.loadUserProfile()

        const role = (
          keycloak.tokenParsed?.realm_access?.roles?.[0] || 'employee'
        ).toLowerCase() as UserRole

        const kcUser: AuthUser = {
          keycloak_id: profile.id || '',
          email: profile.email || '',
          first_name: profile.firstName || '',
          last_name: profile.lastName || '',
          role,
        }

        setAuthUser(kcUser)
        await keycloak.updateToken(30).catch(() => keycloak.login())
        console.log('Keycloak token:', keycloak.token)
        console.log('Token parsed:', keycloak.tokenParsed)
        console.log('Token expires in:', (keycloak.tokenParsed?.exp || 0) - Date.now() / 1000)

        // 2️⃣ Load FULL User from backend
        const res = await api.get<User>('/users/me', {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        })

        setUser(res.data)
      })
      .catch(() => setInitialized(true))
  }, [])

  if (!initialized) return <div>Chargement...</div>

  return (
    <AuthContext.Provider value={{ keycloak, authenticated, initialized, logout, user: authUser }}>
      <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
    </AuthContext.Provider>
  )
}
