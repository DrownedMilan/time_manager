import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import keycloak from './keycloak'
import { AuthContext } from './AuthContext'
import { UserContext } from '@/hooks/useUserContext'

import { api } from '@/services/api'
import type { User } from '@/types/user'

import { logout } from './logout'
import { LoadingPage } from '@/components/common/LoadingPage'

interface KeycloakProviderProps {
  children: ReactNode
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

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

        await keycloak.updateToken(30).catch(() => keycloak.login())
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

  if (!initialized) return <LoadingPage />

  return (
    <AuthContext.Provider value={{ keycloak, authenticated, initialized, logout, user }}>
      <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
    </AuthContext.Provider>
  )
}
