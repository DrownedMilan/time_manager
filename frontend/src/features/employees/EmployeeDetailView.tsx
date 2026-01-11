import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type User, UserRole } from '@/types/user'
import { Mail, Phone, Calendar, Users, Clock, KeyRound, Copy, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import ClockRecordsTable from '@/components/ClockRecordsTable'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { resetUserPassword } from '@/services/userService'
import { useUserClocks } from '@/hooks/useUserClocks'

interface EmployeeDetailViewProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeDetailView({ user, open, onOpenChange }: EmployeeDetailViewProps) {
  const { keycloak } = useAuth()
  const { user: currentUser } = useUser()
  const token = keycloak?.token ?? null

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Fetch user's clock records from API
  const { data: userClocks = [] } = useUserClocks(user?.id ?? null, token)

  if (!user) return null

  // Check if current user can reset passwords (organization or manager)
  // Normalize role comparison to handle case differences
  const normalizeRole = (role: string | undefined) => role?.toLowerCase() || ''
  const currentUserRole = normalizeRole(currentUser?.role)
  const isOrganization =
    currentUserRole === 'organization' || currentUserRole === UserRole.ORGANIZATION.toLowerCase()
  const isManager =
    currentUserRole === 'manager' || currentUserRole === UserRole.MANAGER.toLowerCase()
  const isNotSelf = currentUser && currentUser.id !== user.id

  const canResetPassword = currentUser && (isOrganization || isManager) && isNotSelf

  // Debug: Log current user and role for troubleshooting
  if (open) {
    console.log('EmployeeDetailView - Debug Info:', {
      currentUser: currentUser
        ? {
            id: currentUser.id,
            role: currentUser.role,
            normalizedRole: currentUserRole,
            roleType: typeof currentUser.role,
          }
        : null,
      targetUser: {
        id: user.id,
        role: user.role,
        roleType: typeof user.role,
      },
      checks: {
        isOrganization,
        isManager,
        isNotSelf,
        canResetPassword,
        currentUserRole,
      },
      roleConstants: {
        ORGANIZATION: UserRole.ORGANIZATION,
        MANAGER: UserRole.MANAGER,
        EMPLOYEE: UserRole.EMPLOYEE,
      },
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300'
      case UserRole.ORGANIZATION:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      default:
        return 'bg-green-500/10 border-green-500/30 text-green-300'
    }
  }


  const handleResetPassword = async () => {
    if (!token) {
      toast.error('Authentication token is missing. Please log in again.')
      return
    }

    setIsResetting(true)
    try {
      const result = await resetUserPassword(user.id, token)
      setTempPassword(result.temp_password)
      setShowTempPassword(true)
      setShowResetConfirm(false)
      toast.success('Password reset successfully!')
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; info?: { detail?: string } }
      console.error('Failed to reset password:', error)

      if (err?.status === 403) {
        toast.error('You do not have permission to reset passwords.')
      } else if (err?.status === 400) {
        const errorMessage = err?.info?.detail || err?.message || 'Invalid request'
        toast.error(errorMessage)
      } else {
        toast.error('Failed to reset password. Please try again.')
      }
    } finally {
      setIsResetting(false)
    }
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword)
      setPasswordCopied(true)
      toast.success('Password copied to clipboard!')
      setTimeout(() => setPasswordCopied(false), 2000)
    } catch {
      toast.error('Failed to copy password')
    }
  }

  const handleClose = () => {
    setShowTempPassword(false)
    setTempPassword('')
    setPasswordCopied(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open && !showTempPassword} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-slate-900/95 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white/90">Employee Details</DialogTitle>
            <DialogDescription className="text-white/60">
              View employee information and clock records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Employee Header */}
            <div className="pb-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-cyan-400 shrink-0">
                  <AvatarFallback className="bg-transparent text-white text-xl sm:text-2xl">
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white/90 mb-2 text-lg sm:text-xl break-words">
                    {user.first_name} {user.last_name}
                  </h3>
                  <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Reset Password Button Row */}
              {canResetPassword && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowResetConfirm(true)}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
              )}

              {/* Debug info - remove after testing */}
              {process.env.NODE_ENV === 'development' && currentUser && (
                <div className="mt-2">
                  <span className="text-xs text-white/40">
                    Current: {currentUser.role} | Target: {user.role} | Can Reset:{' '}
                    {canResetPassword ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/60">Email</p>
                  <p className="text-white/90 break-words truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/60">Phone</p>
                  <p className="text-white/90 break-words">{user.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/60">Team</p>
                  <p className="text-white/90 break-words">
                    {user.team?.name || user.managed_team?.name || 'No Team'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/60">Joined</p>
                  <p className="text-white/90 break-words">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Clock Records */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-white/70" />
                <h4 className="text-white/90">Clock Records</h4>
                <span className="text-sm text-white/60">({userClocks.length} total)</span>
              </div>
              <ClockRecordsTable clocks={userClocks} showUser={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="max-w-md w-[95vw] sm:w-full bg-slate-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset Password</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to reset the password for{' '}
              <span className="text-white font-medium">
                {user.first_name} {user.last_name}
              </span>
              ? A temporary password will be generated and the user will be required to change it on
              their next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Temporary Password Display */}
      <Dialog open={showTempPassword} onOpenChange={setShowTempPassword}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full bg-slate-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white/90">Password Reset Successful</DialogTitle>
            <DialogDescription className="text-white/60">
              Temporary password generated for {user.first_name} {user.last_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Label htmlFor="tempPassword" className="text-white/80">
                Temporary Password
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tempPassword"
                  value={tempPassword}
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono"
                />
                <Button
                  type="button"
                  onClick={copyPassword}
                  size="sm"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 shrink-0"
                >
                  {passwordCopied ? (
                    <CheckCheck className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-400 mt-2">
                💡 Share this temporary password with the employee. They will be required to change
                it on their next login.
              </p>
            </div>

            <Button
              onClick={() => {
                setShowTempPassword(false)
                setTempPassword('')
                setPasswordCopied(false)
                handleClose()
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer transition-colors"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
