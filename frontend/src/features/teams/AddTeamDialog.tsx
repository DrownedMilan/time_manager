import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { getUsers } from '@/services/userService'
import { createTeam, addMemberToTeam } from '@/services/teamService'
import type { User } from '@/types/user'
import { UserRole as UserRoleEnum } from '@/types/user'
import type { Team } from '@/types/team'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamCreated?: (team: Team) => void // Updated signature
}

export default function AddTeamDialog({ open, onOpenChange, onTeamCreated }: AddTeamDialogProps) {
  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null

  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState<string>('')
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([])

  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open, token])

  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const fetchedUsers = await getUsers(token)
      setUsers(fetchedUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Get available managers (users with Manager role who don't already manage a team)
  const availableManagers = users.filter((user) => {
    return user.role === UserRoleEnum.MANAGER
  })

  // Get unassigned employees (users without a team)
  const unassignedEmployees = users.filter((user) => {
    return user.role === UserRoleEnum.EMPLOYEE && !user.team
  })

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teamName.trim()) {
      toast.error('Team name is required')
      return
    }

    if (!selectedManagerId) {
      toast.error('Please select a manager')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Create the team
      const newTeam = await createTeam(
        {
          name: teamName.trim(),
          description: description.trim(),
          manager_id: parseInt(selectedManagerId),
        },
        token,
      )

      // 2. Add selected employees to the team
      for (const employeeId of selectedEmployeeIds) {
        try {
          await addMemberToTeam(newTeam.id, employeeId, token)
        } catch (error) {
          console.error(`Failed to add employee ${employeeId} to team:`, error)
          toast.error(`Failed to add some team members`)
        }
      }

      toast.success(`Team "${teamName}" created successfully!`)

      // Reset form and close dialog
      resetForm()
      onOpenChange(false)

      // Notify parent with the new team
      if (onTeamCreated) {
        onTeamCreated(newTeam)
      }
    } catch (error: any) {
      console.error('Failed to create team:', error)
      if (error?.status === 409) {
        toast.error('A team with this name already exists')
      } else {
        toast.error('Failed to create team')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTeamName('')
    setDescription('')
    setSelectedManagerId('')
    setSelectedEmployeeIds([])
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Team</DialogTitle>
          <DialogDescription className="text-white/60">
            Add a new team to your organization with a manager and team members.
          </DialogDescription>
        </DialogHeader>

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            <span className="ml-2 text-white/60">Loading users...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-white/90">
                Team Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Investment Banking"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white/90">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the team's role and responsibilities..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Manager Selection */}
            <div className="space-y-2">
              <Label htmlFor="manager" className="text-white/90">
                Manager <span className="text-red-400">*</span>
              </Label>
              {availableManagers.length > 0 ? (
                <Select
                  value={selectedManagerId}
                  onValueChange={setSelectedManagerId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {availableManagers.map((manager) => (
                      <SelectItem
                        key={manager.id}
                        value={manager.id.toString()}
                        className="text-white"
                      >
                        {manager.first_name} {manager.last_name} ({manager.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-white/60 bg-white/5 p-3 rounded-lg border border-white/10">
                  No available managers. All managers are already assigned to teams.
                </p>
              )}
            </div>

            {/* Employee Selection */}
            <div className="space-y-2">
              <Label className="text-white/90">Team Members</Label>
              {unassignedEmployees.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto bg-white/5 rounded-lg border border-white/10 p-4">
                  {unassignedEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`employee-${employee.id}`}
                        className="text-white/90 cursor-pointer flex-1"
                      >
                        {employee.first_name} {employee.last_name}
                        <span className="text-white/60 text-sm ml-2">({employee.email})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60 bg-white/5 p-3 rounded-lg border border-white/10">
                  No unassigned employees available.
                </p>
              )}
              {selectedEmployeeIds.length > 0 && (
                <p className="text-sm text-white/60">
                  {selectedEmployeeIds.length} employee{selectedEmployeeIds.length > 1 ? 's' : ''}{' '}
                  selected
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                disabled={isSubmitting || availableManagers.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
