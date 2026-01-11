import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import LoginPage from '@/features/auth/LoginPage'
import EmployeeDashboard from '@/features/dashboard/EmployeeDashboard'
import ManagerDashboard from '@/features/dashboard/ManagerDashboard'
import OrganizationDashboard from '@/features/dashboard/OrganizationDashboard'
import UnauthorizedPage from '@/features/errors/UnauthorizedPage'
import NotFoundPage from '@/features/errors/NotFoundPage'
import { LoadingPage } from '@/components/common/LoadingPage'

import DashboardLayout from '@/layouts/DashboardLayout'

const getRoles = (tokenParsed: any): string[] => {
  return tokenParsed?.realm_access?.roles?.map((r: string) => r.toLowerCase()) || []
}

const getHomeRoute = (roles: string[]): string => {
  if (roles.includes('organization')) return '/organization'
  if (roles.includes('manager')) return '/manager'
  return '/dashboard' // default employee
}

const ProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: React.ReactNode
}) => {
  const { authenticated, keycloak, initialized } = useAuth()

  if (!initialized) return <LoadingPage />
  if (!authenticated) return <Navigate to="/login" replace />
  if (!keycloak?.tokenParsed) return <LoadingPage />

  const roles = getRoles(keycloak.tokenParsed)

  const isAllowed =
    allowedRoles.length === 0 || allowedRoles.some((role) => roles.includes(role.toLowerCase()))

  return isAllowed ? children : <Navigate to="/unauthorized" replace />
}

export const AppRoutes = () => {
  const { authenticated, keycloak, initialized } = useAuth()

  // Show loading page while initializing
  if (!initialized) {
    return <LoadingPage />
  }

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          authenticated && keycloak?.tokenParsed ? (
            <Navigate to={getHomeRoute(getRoles(keycloak.tokenParsed))} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* EMPLOYEE */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <DashboardLayout>
              <EmployeeDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* MANAGER */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ORGANIZATION */}
      <Route
        path="/organization"
        element={
          <ProtectedRoute allowedRoles={['organization']}>
            <DashboardLayout>
              <OrganizationDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* DEFAULT REDIRECT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ERROR PAGES */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
