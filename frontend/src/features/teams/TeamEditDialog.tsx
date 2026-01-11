import { useState, useEffect, useRef } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { type UserMinimal, UserRole } from '@/types/user'
import type { Team } from '@/types/team'
import { Save, XCircle, UserPlus, UserMinus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { getUsers } from '@/services/userService'
import {
  getTeams,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
} from '@/services/teamService'
import type { User } from '@/types/user'

interface TeamEditDialogProps {
  team: Team | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (teamId: number) => void
  onTeamUpdated?: (
    updatedTeam: Team,
    addedMemberIds: number[],
    removedMemberIds: number[],
    newManagerId: number | null,
    oldManagerId: number | null,
  ) => void
  onSave?: () => void // Keep for backward compatibility
}

export default function TeamEditDialog({
  team,
  open,
  onOpenChange,
  onDelete,
  onTeamUpdated,
  onSave,
}: TeamEditDialogProps) {
  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [managerId, setManagerId] = useState<string>('')
  const [members, setMembers] = useState<UserMinimal[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])

  // Track original values to detect changes
  const originalManagerId = useRef<number | null>(null)
  const originalMemberIds = useRef<number[]>([])
  const addedMemberIds = useRef<number[]>([])
  const removedMemberIds = useRef<number[]>([])

  // Fetch users and teams when dialog opens
  useEffect(() => {
    if (open && token) {
      Promise.all([getUsers(token), getTeams(token)])
        .then(([fetchedUsers, fetchedTeams]) => {
          setUsers(fetchedUsers)
          setAllTeams(fetchedTeams)
        })
        .catch(console.error)
    }
  }, [open, token])

  // Get manager IDs that are already assigned to OTHER teams (not this one)
  const assignedManagerIds = new Set(
    allTeams.filter((t) => t.manager_id !== null && t.id !== team?.id).map((t) => t.manager_id!),
  )

  // Get available managers (users with Manager role who don't already manage another team)
  // Also include the current manager of this team
  const availableManagers = users.filter((user) => {
    if (user.role !== UserRole.MANAGER) return false
    // Include if they're the current manager of this team
    if (team && user.id === team.manager_id) return true
    // Otherwise, only include if not assigned to another team
    return !assignedManagerIds.has(user.id)
  })

  // Get available employees (EMPLOYEE role, not already in the team, and not assigned to another team)
  const availableEmployees = users.filter((user) => {
    if (user.role !== UserRole.EMPLOYEE) return false
    // Exclude if already in this team's members
    if (members.some((member) => member.id === user.id)) return false
    // Exclude if already assigned to another team
    if (user.team && user.team.id !== team?.id) return false
    return true
  })

  useEffect(() => {
    if (team) {
      setName(team.name)
      setDescription(team.description)
      setManagerId(team.manager_id?.toString() || '')
      setMembers([...team.members])
      // Store original values
      originalManagerId.current = team.manager_id
      originalMemberIds.current = team.members.map((m) => m.id)
      addedMemberIds.current = []
      removedMemberIds.current = []
    }
  }, [team])

  const handleAddMember = async () => {
    if (!selectedEmployeeId || !team) {
      toast.error('Please select an employee to add')
      return
    }

    const employee = users.find((u) => u.id.toString() === selectedEmployeeId)
    if (employee) {
      try {
        await addMemberToTeam(team.id, employee.id, token)
        const newMember: UserMinimal = {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          phone_number: employee.phone_number,
          role: employee.role,
        }
        setMembers([...members, newMember])
        setSelectedEmployeeId('')
        // Track addition
        if (!originalMemberIds.current.includes(employee.id)) {
          addedMemberIds.current.push(employee.id)
        }
        // Remove from removed list if re-added
        removedMemberIds.current = removedMemberIds.current.filter((id) => id !== employee.id)
        toast.success(`${employee.first_name} ${employee.last_name} added to team`)
      } catch (error) {
        console.error('Failed to add member:', error)
        toast.error('Failed to add member to team')
      }
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!team) return

    const member = members.find((m) => m.id === memberId)
    try {
      await removeMemberFromTeam(team.id, memberId, token)
      setMembers(members.filter((m) => m.id !== memberId))
      // Track removal
      if (originalMemberIds.current.includes(memberId)) {
        removedMemberIds.current.push(memberId)
      }
      // Remove from added list if removed before save
      addedMemberIds.current = addedMemberIds.current.filter((id) => id !== memberId)
      if (member) {
        toast.success(`${member.first_name} ${member.last_name} removed from team`)
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member from team')
    }
  }

  const handleSave = async () => {
    if (!team) return

    if (!name.trim()) {
      toast.error('Team name is required')
      return
    }

    if (!description.trim()) {
      toast.error('Team description is required')
      return
    }

    setIsSubmitting(true)
    try {
      const newManagerId = managerId && managerId !== 'none' ? parseInt(managerId) : null
      await updateTeam(
        {
          name: name.trim(),
          description: description.trim(),
          manager_id: newManagerId,
        },
        team.id,
        token,
      )
      // Build the updated team object
      const newManager = newManagerId ? users.find((u) => u.id === newManagerId) : null
      const updatedTeam: Team = {
        ...team,
        name: name.trim(),
        description: description.trim(),
        manager_id: newManagerId,
        manager: newManager
          ? {
              id: newManager.id,
              first_name: newManager.first_name,
              last_name: newManager.last_name,
              email: newManager.email,
            }
          : null,
        members: members,
      }
      toast.success(`Team "${name}" updated successfully!`)
      onOpenChange(false)
      // Notify parent with all changes
      if (onTeamUpdated) {
        onTeamUpdated(
          updatedTeam,
          addedMemberIds.current,
          removedMemberIds.current,
          newManagerId,
          originalManagerId.current
        )
      }
      
      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error('Failed to update team:', error)
      toast.error('Failed to update team')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!team) return

    setIsDeleting(true)
    try {
      await deleteTeam(team.id, token)
      toast.success(`Team "${team.name}" deleted successfully!`)
      setShowDeleteConfirm(false)
      onOpenChange(false)
      if (onDelete) {
        onDelete(team.id)
      }
    } catch (error) {
      console.error('Failed to delete team:', error)
      toast.error('Failed to delete team')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!team) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-slate-950 border-white/10 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white/90">Edit Team</DialogTitle>
            <DialogDescription className="text-white/60">
              Update team information, assign a manager, and manage members
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            <div className="space-y-4">
              {/* Team Name */}
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-white/80">
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="Enter team name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/80">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                  placeholder="Enter team description"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* Manager Selection */}
              <div className="space-y-2">
                <Label htmlFor="manager" className="text-white/80">
                  Team Manager
                </Label>
                <Select value={managerId} onValueChange={setManagerId} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="none" className="text-white/60">
                      No Manager
                    </SelectItem>
                    {availableManagers.map((manager) => (
                      <SelectItem
                        key={manager.id}
                        value={manager.id.toString()}
                        className="text-white"
                      >
                        {manager.first_name} {manager.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-white/10" />

              {/* Team Members Management */}
              <div className="space-y-3">
                <Label className="text-white/80">Team Members ({members.length})</Label>

                {/* Add Member Section */}
                <div className="flex gap-2">
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
                      <SelectValue placeholder="Select employee to add" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      {availableEmployees.length === 0 ? (
                        <SelectItem value="no-employees" disabled className="text-white/40">
                          No employees available
                        </SelectItem>
                      ) : (
                        availableEmployees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={employee.id.toString()}
                            className="text-white"
                          >
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddMember}
                    size="sm"
                    disabled={
                      !selectedEmployeeId || availableEmployees.length === 0 || isSubmitting
                    }
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {/* Current Members List */}
                <div className="space-y-2">
                  {members.length === 0 ? (
                    <div className="text-center py-4 px-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-white/60 text-sm">No members in this team</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <p className="text-white/90">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-white/60 text-sm">{member.email}</p>
                          </div>
                          <Button
                            onClick={() => handleRemoveMember(member.id)}
                            size="sm"
                            variant="outline"
                            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            disabled={isSubmitting}
                          >
                            <UserMinus className="w-4 h-4" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-white/10 mt-4">
            {/* Delete Button */}
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
              variant="outline"
              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              disabled={isSubmitting || isDeleting}
            >
              <Trash2 className="w-4 h-4" />
              Delete Team
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                size="sm"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                disabled={isSubmitting}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-slate-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Team</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">{team?.name}</span>? This action cannot be
              undone. All team members will be unassigned from this team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Team'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
