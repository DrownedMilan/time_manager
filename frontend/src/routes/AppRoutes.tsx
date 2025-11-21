// src/routes/AppRoutes.tsx

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
// import { useUser } from "@/hooks/useUser"

import LoginPage from "@/features/auth/LoginPage"
import EmployeeDashboard from "@/features/dashboard/EmployeeDashboard"
import ManagerDashboard from "@/features/dashboard/ManagerDashboard"
import OrganizationDashboard from "@/features/dashboard/OrganizationDashboard"

import DashboardLayout from "@/components/common/DashboardLayout"

export const ProtectedRoute = ({ children, allowedRoles }: any) => {
  const { keycloak, authenticated } = useAuth()

  if (!authenticated) return <Navigate to="/login" replace />
  if (!keycloak?.tokenParsed) return <div>Chargement...</div>

  const roles =
    keycloak.tokenParsed.realm_access?.roles?.map((r: string) => r.toLowerCase()) || []

  if (allowedRoles && !allowedRoles.some((r: any) => roles.includes(r.toLowerCase()))) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export const AppRoutes = () => {
  const { authenticated } = useAuth()

  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* EMPLOYEE */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee", "manager", "organization"]}>
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
          <ProtectedRoute allowedRoles={["manager"]}>
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
          <ProtectedRoute allowedRoles={["organization"]}>
            <DashboardLayout>
              <OrganizationDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* DEFAULTS */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/unauthorized" element={<div>🚫 Access Denied</div>} />
      <Route path="*" element={<div>❌ 404 Not Found</div>} />

    </Routes>
  )
}