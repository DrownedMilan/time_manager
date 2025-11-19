import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import keycloak from './keycloak'
import { AuthContext } from './AuthContext'
import { logout } from './logout'

interface KeycloakProviderProps {
  children: ReactNode
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    keycloak
      .init({
        // onLoad: 'check-sso', // ou 'login-required' si tu veux forcer le login
        onLoad: 'login-required',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      })
      .then((auth) => {
        setAuthenticated(auth)
        setInitialized(true)

        if (auth && keycloak.token) {
          localStorage.setItem('kc_token', keycloak.token)
          console.log('✅ Token complet :', keycloak.token)
          console.log('🧩 Token décodé :', keycloak.tokenParsed)
        }

        const refreshInterval = setInterval(async () => {
          try {
            const refreshed = await keycloak.updateToken(60)
            if (refreshed && keycloak.token) {
              localStorage.setItem('kc_token', keycloak.token)
              console.info('[Keycloak] 🔄 Token refreshed')
            }
          } catch (err) {
            console.warn('[Keycloak] Token refresh failed', err)
          }
        }, 60000) // toutes les 60s

        return () => clearInterval(refreshInterval)
      })
      .catch((err) => {
        console.error('[Keycloak] Init error', err)
        setInitialized(true)
      })
  }, [])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="text-center">
          <p className="text-xl font-semibold animate-pulse">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={
        {
          keycloak,
          authenticated,
          initialized,
          logout: logout,
        }
      }
    >
      {children}
    </AuthContext.Provider>
  )
}
