import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import UsersPage from '@/pages/UsersPage'
import LoginPage from '@/pages/LoginPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Layout principal */}
      <Route element={<AppLayout />}>
        {/* <Route path="/" element={<DashboardPage />} /> */}
        <Route path="/" element={<UsersPage />} />
      </Route>

      {/* Routes publiques (sans layout, ex: Login) */}
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
