import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type User, UserRole } from '@/types/user'
import { mockClocks } from '../../lib/mockData'
import { Mail, Phone, Calendar, Users, Clock } from 'lucide-react'
import ClockRecordsTable from '@/components/ClockRecordsTable'

interface EmployeeDetailViewProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeDetailView({ user, open, onOpenChange }: EmployeeDetailViewProps) {
  if (!user) return null

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

  // Get user's clock records
  const userClocks = mockClocks.filter((clock) => clock.user_id === user.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-slate-900/95 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white/90">Employee Details</DialogTitle>
          <DialogDescription className="text-white/60">
            View employee information and clock records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Header */}
          <div className="flex items-start gap-6 pb-6 border-b border-white/10">
            <Avatar className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400">
              <AvatarFallback className="bg-transparent text-white text-2xl">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="text-white/90 mb-2">
                {user.first_name} {user.last_name}
              </h3>
              <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-white/60">Email</p>
                <p className="text-white/90">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Phone className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-white/60">Phone</p>
                <p className="text-white/90">{user.phone_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-white/60">Team</p>
                <p className="text-white/90">
                  {user.team?.name || user.managed_team?.name || 'No Team'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-white/60">Joined</p>
                <p className="text-white/90">
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
  )
}
