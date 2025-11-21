import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, User, UsersRound, Plus, Building2 } from 'lucide-react'
import PasswordChangeDialog from '@/features/auth/PasswordChangeDialog'
import EmployeeEditDialog from '@/features/employees/EmployeeEditDialog'
import logo from '/primebank_logo.png'
import { useUser } from '@/hooks/useUser'
import { UserRole } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser()
  const { logout } = useAuth()

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isEmployeeEditOpen, setIsEmployeeEditOpen] = useState(false)

  if (!user) return null

  console.log('DashboardLayout user:', user)

  const getRoleDisplay = () => {
    switch (user.role) {
      case UserRole.ORGANIZATION:
        return 'Organization Admin'
      case UserRole.MANAGER:
        return 'Team Manager'
      default:
        return 'Employee'
    }
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case UserRole.ORGANIZATION:
        return <Building2 className="w-5 h-5" />
      case UserRole.MANAGER:
        return <UsersRound className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl p-2 flex items-center justify-center">
                <img src={logo} className="w-full h-full" />
              </div>

              <div>
                <h1 className="text-white/90">PrimeBank</h1>
                <p className="text-xs text-white/60">{getRoleDisplay()}</p>
              </div>
            </div>

            <div className="flex items-stretch gap-3">
              {user.role === UserRole.ORGANIZATION && (
                <Button
                  onClick={() => setIsEmployeeEditOpen(true)}
                  className="h-10 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-1 text-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Employee
                </Button>
              )}

              <div
                onClick={() => setIsPasswordDialogOpen(true)}
                className="h-10 hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  {getRoleIcon()}
                </div>

                <div>
                  <p className="text-sm text-white">{user.first_name}</p>
                  <p className="text-xs text-white/60">{getRoleDisplay()}</p>
                </div>
              </div>

              <Button
                onClick={logout}
                className="h-10 px-4 bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 rounded-xl flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8">{children}</main>

      {/* Dialogs */}
      <PasswordChangeDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        userName={user.first_name}
        userEmail={user.email}
      />

      {user.role === UserRole.ORGANIZATION && (
        <EmployeeEditDialog open={isEmployeeEditOpen} onOpenChange={setIsEmployeeEditOpen} />
      )}
    </div>
  )
}
