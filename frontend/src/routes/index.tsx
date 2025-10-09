import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import UsersPage from '@/pages/UsersPage'
// import DashboardPage from '@/pages/DashboardPage'
// import LoginPage from '@/pages/LoginPage'

interface AppRoutesProps {
  toggleTheme: () => void
  mode: 'light' | 'dark'
}

export default function AppRoutes({ toggleTheme, mode }: AppRoutesProps) {
  return (
    <Routes>
      {/* Layout principal */}
      <Route element={<AppLayout toggleTheme={toggleTheme} mode={mode} />}>
        {/* <Route path="/" element={<DashboardPage />} /> */}
        <Route path="/" element={<UsersPage />} />
      </Route>

      {/* Routes publiques (sans layout, ex: Login) */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  )
}
