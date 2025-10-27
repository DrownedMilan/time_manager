import { useState } from 'react'
import Login from './components/Login'
import DashboardLayout from './components/DashboardLayout'
import EmployeeDashboard from './components/EmployeeDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import OrganizationDashboard from './components/OrganizationDashboard'
import { UserRole, User } from './types'
import { mockUsers } from './lib/mockData'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleLogin = (email: string, role: UserRole) => {
    // Find user by email or create a mock user
    const user = mockUsers.find((u) => u.email === email) || mockUsers.find((u) => u.role === role)

    if (user) {
      setCurrentUser(user)
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  if (!isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} />
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.ORGANIZATION:
        return <OrganizationDashboard user={currentUser} />
      case UserRole.MANAGER:
        return <ManagerDashboard user={currentUser} />
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard user={currentUser} />
      default:
        return <EmployeeDashboard user={currentUser} />
    }
  }

  return (
    <DashboardLayout
      userRole={currentUser.role}
      userName={`${currentUser.first_name} ${currentUser.last_name}`}
      userEmail={currentUser.email}
      onLogout={handleLogout}
    >
      {renderDashboard()}
    </DashboardLayout>
  )
}
