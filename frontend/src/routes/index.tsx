import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/pages/LoginPage'
import UserDashboard from '@/pages/UserDashboard'
import ManagerDashboard from '@/pages/ManagerDashboard'
import OrganizationDashboard from '@/pages/OrganizationDashboard'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

type ResourceAccess = Record<string, { roles: string[] }>

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { keycloak, authenticated } = useAuth()

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  if (!keycloak || !keycloak.tokenParsed) {
    return <div>Chargement de la session...</div>
  }

  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || []

  const resourceAccess = keycloak.tokenParsed?.resource_access as ResourceAccess | undefined
  const resourceRoles = resourceAccess ? Object.values(resourceAccess).flatMap((r) => r.roles) : []

  const allRoles = [...realmRoles, ...resourceRoles]

  if (allowedRoles && !allowedRoles.some((role) => allRoles.includes(role))) {
    console.warn('🚫 Accès refusé - rôles utilisateur :', allRoles)
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export const AppRoutes = () => {
  const { authenticated } = useAuth()

  return (
    <Routes>
      {/* --- Public --- */}
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* --- Dashboards protégés --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization"
        element={
          <ProtectedRoute allowedRoles={['organization']}>
            <OrganizationDashboard />
          </ProtectedRoute>
        }
      />

      {/* --- Routes par défaut --- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<div>🚫 Accès refusé</div>} />
      <Route path="*" element={<div>❌ 404 - Page introuvable</div>} />
    </Routes>
  )
}
