import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/features/auth/LoginPage";
import EmployeeDashboard from "@/features/dashboard/EmployeeDashboard";
import ManagerDashboard from "@/features/dashboard/ManagerDashboard";
import OrganizationDashboard from "@/features/dashboard/OrganizationDashboard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { keycloak, authenticated } = useAuth();

  if (!authenticated) return <Navigate to="/login" replace />;
  if (!keycloak?.tokenParsed) return <div>Chargement...</div>;

  const roles = keycloak.tokenParsed.realm_access?.roles || [];

  if (allowedRoles && !allowedRoles.some(r => roles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { authenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* EMPLOYEE */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* MANAGER */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ORGANIZATION */}
      <Route
        path="/organization"
        element={
          <ProtectedRoute allowedRoles={["Organization"]}>
            <OrganizationDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<div>🚫 Accès refusé</div>} />
      <Route path="*" element={<div>❌ 404</div>} />
    </Routes>
  );
};
