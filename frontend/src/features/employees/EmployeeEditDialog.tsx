import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { type User, UserRole } from '@/types/user'
import { Save, XCircle, Copy, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { createUser, updateUser, type UserCreatePayload } from '@/services/userService'

interface EmployeeEditDialogProps {
  user?: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (userId: number) => void
  onSave?: (savedUser: User, isNew: boolean) => void // Updated signature
}

export default function EmployeeEditDialog({
  user,
  open,
  onOpenChange,
  onDelete,
  onSave,
}: EmployeeEditDialogProps) {
  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE)
  const [tempPassword, setTempPassword] = useState('')
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)

  useEffect(() => {
    // Only reset form when dialog opens/closes, not when user changes
    if (!open) {
      // Reset when dialog closes
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhoneNumber('')
      setRole(UserRole.EMPLOYEE)
      setTempPassword('')
      setPasswordCopied(false)
      setShowTempPassword(false)
      setCreatedUserId(null)
      return
    }

    // Don't reset if we just created a user and are showing the temp password
    if (showTempPassword && createdUserId) {
      return
    }

    if (user) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setEmail(user.email)
      setPhoneNumber(user.phone_number ?? '')
      setRole(user.role)
      setTempPassword('') // No password for editing
      setPasswordCopied(false)
      setShowTempPassword(false)
      setCreatedUserId(null)
    } else {
      // Reset form for new employee
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhoneNumber('')
      setRole(UserRole.EMPLOYEE)
      setTempPassword('') // Will be set by backend after creation
      setPasswordCopied(false)
      setShowTempPassword(false)
      setCreatedUserId(null)
    }
  }, [user, open, showTempPassword, createdUserId])

  const handleSave = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!token) {
      toast.error('Authentication token is missing. Please log in again.')
      return
    }

    setIsSubmitting(true)

    try {
      let savedUser: User

      if (user) {
        // Update existing user
        savedUser = await updateUser(
          user.id,
          {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            phone_number: phoneNumber.trim(),
          },
          token,
        )
        toast.success(`Employee ${firstName} ${lastName} updated successfully!`)
        onOpenChange(false)
        if (onSave) {
          onSave(savedUser, false)
        }
      } else {
        // Create new user
        const payload: UserCreatePayload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          keycloak_id: '', // Backend will create in Keycloak
          realm_roles: [role.toLowerCase()],
        }
        const result = await createUser(payload, token)
        savedUser = result.user

        // Set temporary password if returned from backend
        if (result.tempPassword) {
          setTempPassword(result.tempPassword)
          setShowTempPassword(true)
          setCreatedUserId(savedUser.id) // Track that we just created this user
        }

        toast.success(`Employee ${firstName} ${lastName} added successfully!`)

        // Update the user list in parent component
        if (onSave) {
          onSave(savedUser, true)
        }

        // Update the user state to the newly created user so the form shows as "editing" mode
        // This prevents the dialog from resetting when onSave updates the parent state
        // Keep dialog open to show temp password - don't close it automatically
        // User can close manually after copying the password
      }
} catch (err: unknown) {

  const error = err as any
  const status = error?.status ?? error?.response?.status ?? error?.info?.status

  const detail =
    error?.info?.detail ??
    error?.response?.data?.detail ??
    error?.response?.data?.message ??
    error?.message

  const msg = String(detail ?? '').toLowerCase()

  // 🔁 Cas doublon (email / téléphone)
  if (status === 409 || status === 422) {
    toast.error('This email address or phone number is already in use.')
    return
  }

  // 🔁 Fallback si le backend renvoie 500 au lieu de 409
  if (
    status === 500 &&
    (msg.includes('unique') ||
      msg.includes('duplicate') ||
      msg.includes('already') ||
      msg.includes('exists'))
  ) {
    toast.error('This email address or phone number is already in use.')
    return
  }

  // 🔐 Auth / permissions
  if (status === 401) {
    toast.error('Session expired. Please log in again.')
    return
  }

  if (status === 403) {
    toast.error("You do not have permission to perform this action.")
    return
  }

  // 🧯 Erreur serveur générique
  if (status === 500) {
    toast.error("Server error during registration. Please try again.")
    return
  }

  // 🧩 Fallback final (toujours un message)
  toast.error(
    `Impossible de ${user ? 'mettre à jour' : 'créer'} l’employé${
      detail ? ` : ${String(detail)}` : ''
    }`,
  )
} finally {
  setIsSubmitting(false)
}

  }

  const handleCancel = () => {
    setShowTempPassword(false)
    setTempPassword('')
    setCreatedUserId(null)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (user && onDelete) {
      onDelete(user.id)
      setShowDeleteConfirm(false)
      onOpenChange(false)
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

  const roleChanged = user && role !== user.role

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full bg-slate-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white/90">
              {user ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {user
                ? 'Update employee information and manage their role'
                : 'Enter new employee details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white/80">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                placeholder="Enter first name"
                disabled={isSubmitting}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white/80">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                placeholder="Enter last name"
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                placeholder="Enter email"
                disabled={isSubmitting}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white/80">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                placeholder="Enter phone number"
                disabled={isSubmitting}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white/80">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value={UserRole.EMPLOYEE} className="text-white">
                    {UserRole.EMPLOYEE}
                  </SelectItem>
                  <SelectItem value={UserRole.MANAGER} className="text-white">
                    {UserRole.MANAGER}
                  </SelectItem>
                  <SelectItem value={UserRole.ORGANIZATION} className="text-white">
                    {UserRole.ORGANIZATION}
                  </SelectItem>
                </SelectContent>
              </Select>
              {roleChanged && (
                <p className="text-xs text-amber-400 mt-1">
                  ⚠️ Changing role will affect permissions and team assignments
                </p>
              )}
            </div>

            {/* Temporary Password (only for new employees or after creation) */}
            {showTempPassword && tempPassword && (
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
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 shrink-0 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {passwordCopied ? (
                      <CheckCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-blue-400 mt-2">
                  This temporary password must be used for the employee's first login. Keycloak will
                  automatically prompt them to change it.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              {/* Delete Button (only for existing employees) */}
              {user && onDelete && (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                  variant="outline"
                  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}

              {/* Spacer when no delete button */}
              {(!user || !onDelete) && <div />}

              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting || (showTempPassword && createdUserId !== null)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : showTempPassword && createdUserId !== null ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      User Created
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-slate-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Employee</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">
                {user?.first_name} {user?.last_name}
              </span>
              ? This action cannot be undone and will remove all associated data including clock
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/20 text-white hover:bg-white/10 cursor-pointer transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}



