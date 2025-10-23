import { Navigate } from 'react-router-dom'
import UserDashboardView from '@/components/UserDashboard'
// import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'
import { logout } from '@/auth/logout'

export default function UserDashboardPage() {
  // const { user, logout } = useAuth()
  const [userId] = useState<number>(1)
  const { data: user, isLoading, isError, error } = useUser(userId)

  // 1️⃣ Handle loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading user...
      </div>
    )
  }

  // 2️⃣ Handle API errors
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        Error loading user: {String(error)}
      </div>
    )
  }

  // 3️⃣ Handle unauthorized / missing user
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <UserDashboardView user={user} onLogout={logout} />
    </div>
  )
}
