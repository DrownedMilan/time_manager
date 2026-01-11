import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Lock, Eye, EyeOff, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { changePassword, updateUser } from '../../services/userService'

interface PasswordChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  userName: string
  userEmail: string
  userPhoneNumber: string | null
  userTeamName: string | null
}

export default function PasswordChangeDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  userPhoneNumber,
  userTeamName,
}: PasswordChangeDialogProps) {
  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null

  const [email, setEmail] = useState(userEmail)
  const [phoneNumber, setPhoneNumber] = useState(userPhoneNumber || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes or props change
  useEffect(() => {
    if (open) {
      setEmail(userEmail)
      setPhoneNumber(userPhoneNumber || '')
    }
  }, [open, userEmail, userPhoneNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Authentication token is missing. Please log in again.')
      return
    }

    setIsSubmitting(true)

    try {
      const updates: Promise<unknown>[] = []

      // Update email/phone if changed
      const emailChanged = email.trim() !== userEmail
      const phoneChanged = phoneNumber.trim() !== (userPhoneNumber || '')

      if (emailChanged || phoneChanged) {
        const updatePayload: { email?: string; phone_number?: string } = {}
        if (emailChanged) {
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email.trim())) {
            toast.error('Please enter a valid email address')
            setIsSubmitting(false)
            return
          }
          updatePayload.email = email.trim()
        }
        if (phoneChanged) {
          updatePayload.phone_number = phoneNumber.trim()
        }
        updates.push(updateUser(userId, updatePayload, token))
      }

      // Update password if password fields are filled
      const passwordChanged = currentPassword && newPassword && confirmPassword
      if (passwordChanged) {
        // Validation
        if (newPassword.length < 8) {
          toast.error('New password must be at least 8 characters long')
          setIsSubmitting(false)
          return
        }

        if (newPassword !== confirmPassword) {
          toast.error('New password and confirmation do not match')
          setIsSubmitting(false)
          return
        }

        if (currentPassword === newPassword) {
          toast.error('New password must be different from current password')
          setIsSubmitting(false)
          return
        }

        updates.push(
          changePassword(
            {
              current_password: currentPassword,
              new_password: newPassword,
            },
            token,
          ),
        )
      }

      if (updates.length === 0) {
        toast.info('No changes to save')
        setIsSubmitting(false)
        return
      }

      await Promise.all(updates)

      const changes = []
      if (emailChanged) changes.push('email')
      if (phoneChanged) changes.push('phone number')
      if (passwordChanged) changes.push('password')

      toast.success(
        changes.length > 0
          ? `${changes.join(', ')} updated successfully`
          : 'Changes saved successfully',
      )
      handleClose()
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; info?: { detail?: string } }
      console.error('Failed to save changes:', err)

      if (err?.status === 401) {
        toast.error('Current password is incorrect')
      } else if (err?.status === 400) {
        const errorMessage = err?.info?.detail || err?.message || 'Invalid input'
        toast.error(errorMessage)
      } else {
        toast.error('Failed to save changes. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail(userEmail)
    setPhoneNumber(userPhoneNumber || '')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white/90">Profile Settings</DialogTitle>
          <DialogDescription className="text-white/60">
            Update your profile information and password
          </DialogDescription>
        </DialogHeader>

        {/* User Info */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/90">{userName}</p>
              <p className="text-sm text-white/70 mt-0.5">{userTeamName || 'No team'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pl-10"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone-number" className="text-white/80">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pl-10"
              />
            </div>
          </div>

          {/* <div className="border-t border-white/10 pt-4">
            <h3 className="text-white/90 text-sm font-medium mb-4">Change Password</h3>
          </div> */}

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white/80">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white/80">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white/80">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements - Only show if password fields are filled */}
          {(currentPassword || newPassword || confirmPassword) && (
            <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
              <p className="text-xs text-white/70 mb-2">Password requirements:</p>
              <ul className="text-xs text-white/60 space-y-1">
                <li className={newPassword.length >= 8 ? 'text-green-400' : ''}>
                  • At least 8 characters long
                </li>
                <li
                  className={newPassword !== currentPassword && newPassword ? 'text-green-400' : ''}
                >
                  • Different from current password
                </li>
                <li
                  className={
                    newPassword === confirmPassword && confirmPassword ? 'text-green-400' : ''
                  }
                >
                  • Passwords match
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
