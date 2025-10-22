/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react'
import keycloak from './keycloak'

interface AuthContextType {
  keycloak: Keycloak.KeycloakInstance
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

export const KeycloakProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      })
      .then((auth) => {
        setAuthenticated(auth)
        setInitialized(true)
      })
      .catch((err) => {
        console.error('[Keycloak] Init error', err)
        setInitialized(true)
      })
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    try {
      keycloak.logout({ redirectUri: window.location.origin })
    } catch (e) {
      console.warn('Erreur lors du logout Keycloak:', e)
    }
    setAuthenticated(false)
  }

  if (!initialized) {
    // 🔄 version stylée
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="text-center">
          <p className="text-xl font-semibold animate-pulse">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ keycloak, authenticated, initialized, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}
