import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import LoginPage from '@/pages/LoginPage'
import UserDashboard from '@/pages/UserDashboard'
import ManagerDashboard from '@/pages/ManagerDashboard'
import OrganizationDashboard from '@/pages/OrganizationDashboard'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[] // facultatif pour autoriser tout utilisateur connecté
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { keycloak, authenticated } = useAuth()

  // 🔒 Pas connecté → rediriger vers login
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  // 🔐 Récupérer les rôles depuis le token Keycloak
  const roles = keycloak.tokenParsed?.realm_access?.roles || []

  // Si la route est limitée à certains rôles et que l'utilisateur n'en fait pas partie
  if (allowedRoles && !allowedRoles.some((role) => roles.includes(role))) {
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
