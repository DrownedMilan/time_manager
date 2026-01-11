import { useState } from 'react'
import StatCard from '@/components/common/StatCard'
import ClockWidget from '@/components/common/ClockWidget'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, User as UserIcon, Calendar, ClockAlert, Mail, Phone } from 'lucide-react'
import { type Clock as ClockType } from '@/types/clock'
import { mockClocks, mockUsers } from '../../lib/mockData'
import { useUser } from '@/hooks/useUser'
import { useUserClocks } from '@/hooks/useUserClocks'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function EmployeeDashboard() {
  const { user } = useUser()
  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null

  // const [clocks, setClocks] = useState<ClockType[]>([])

  // Load clocks when user becomes available
  // useEffect(() => {
  //   if (user) {
  //     setClocks(mockClocks.filter((c) => c.user_id === user.id))
  //   }
  // }, [user])

  // Fetch real clocks from API
  const {
    data: clocks,
    isLoading: clocksLoading,
    refetch: refetchClocks,
  } = useUserClocks(user?.id ?? null, token)

  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)

  if (!user) {
    return <div>Loading...</div>
  }

  if (clocksLoading && clocks === null) {
    return <div>Loading clocks...</div>
  }

  const clocksList = clocks ?? []
  const currentClock = clocksList.find((c) => !c.clock_out) || null
  const completedClocks = clocksList.filter((c) => c.clock_out)
  const totalHoursThisWeek = completedClocks.reduce((acc, clock) => {
    if (clock.clock_out) {
      const diff = new Date(clock.clock_out).getTime() - new Date(clock.clock_in).getTime()
      return acc + diff / (1000 * 60 * 60)
    }
    return acc
  }, 0)

  // Calculate average late time in the past 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentClocks = clocksList.filter((c) => new Date(c.clock_in) >= thirtyDaysAgo)

  const lateMinutes = recentClocks.map((clock) => {
    const clockInDate = new Date(clock.clock_in)
    const clockInHour = clockInDate.getHours()
    const clockInMinute = clockInDate.getMinutes()
    const clockInTotalMinutes = clockInHour * 60 + clockInMinute
    const workStartMinutes = 9 * 60 // 9:00 AM in minutes

    return Math.max(0, clockInTotalMinutes - workStartMinutes)
  })

  const avgLateMinutes =
    lateMinutes.length > 0 ? lateMinutes.reduce((sum, min) => sum + min, 0) / lateMinutes.length : 0

  // Calculate working days this month (Mon-Fri)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // Calculate total working days in current month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let totalWorkingDays = 0

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday (0) or Saturday (6)
      totalWorkingDays++
    }
  }

  // Calculate days worked this month
  const firstDayOfMonth = new Date(year, month, 1)
  const clocksThisMonth = clocksList.filter((c) => {
    const clockDate = new Date(c.clock_in)
    return clockDate >= firstDayOfMonth && c.clock_out
  })

  // Get unique dates worked (in case of multiple clock entries per day)
  const daysWorkedSet = new Set(clocksThisMonth.map((c) => new Date(c.clock_in).toDateString()))
  const daysWorked = daysWorkedSet.size

  const handleClockIn = async () => {
    try {
      await api<ClockType>('/clocks/', {
        method: 'POST',
        body: { user_id: user.id },
        authToken: token,
      })
      refetchClocks()
    } catch (err) {
    }
  }

  const handleClockOut = async () => {
    try {
      await api<ClockType>('/clocks/', {
        method: 'POST',
        body: { user_id: user.id },
        authToken: token,
      })
      refetchClocks()
    } catch (err) {
    }
  }

 

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h2 className="text-white/90 mb-[6px] mt-[0px] mr-[0px] ml-[0px]">
          Welcome back, {user.first_name}! (Employee Dashboard)
        </h2>
      </div>

      {/* Quick Info */}
      <div className="mb-8">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs mb-1">Email</span>
              <span className="text-white/90">{user.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-xs mb-1">Phone</span>
              <span className="text-white/90">{user.phone_number || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-xs mb-1">Team</span>
              <span className="text-white/90">{user.team?.name || 'Not assigned'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-xs mb-1">Manager</span>
              <span className="text-white/90">
                {user.team?.manager
                  ? `${user.team.manager.first_name} ${user.team.manager.last_name}`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-xs mb-1">Member Since</span>
              <span className="text-white/90">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Hours This Week"
          value={`${totalHoursThisWeek.toFixed(1)}h`}
          icon={Clock}
          description="Total working hours"
          progress={{ current: totalHoursThisWeek, total: 35, unit: 'hours' }}
        />
        <StatCard
          title="Average Late Time"
          value={avgLateMinutes < 1 ? 'On Time' : `${Math.round(avgLateMinutes)} min`}
          icon={ClockAlert}
          description="Past 30 days"
          trend={
            avgLateMinutes > 0
              ? { value: `${Math.round(avgLateMinutes)} min late`, positive: false }
              : undefined
          }
        />
        <StatCard
          title="Working Days This Month"
          value={`${daysWorked}/${totalWorkingDays}`}
          icon={Calendar}
          description={`${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
          progress={{ current: daysWorked, total: totalWorkingDays }}
        />
        <StatCard
          title="Team"
          value={user.team?.name || 'No Team'}
          icon={UserIcon}
          description={
            user.team?.manager?.first_name
              ? `Manager: ${user.team.manager.first_name}`
              : 'Not assigned'
          }
          onClick={user.team ? () => setIsTeamDialogOpen(true) : undefined}
        />
      </div>

      {/* Clock Widget and Clock Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ClockWidget
            userId={user.id}
            currentClock={currentClock}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden h-[420px] flex flex-col">
            <h3 className="text-white/80 text-sm p-4 border-b border-white/10 flex-shrink-0">
              Your Clock Records
            </h3>
            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {clocksList.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-white/50 text-xs">No records found</p>
                  </div>
                ) : (
                  clocksList.slice(0, 5).map((clock) => {
                    const duration = clock.clock_out
                      ? (() => {
                          const diff =
                            new Date(clock.clock_out).getTime() - new Date(clock.clock_in).getTime()
                          const hours = Math.floor(diff / (1000 * 60 * 60))
                          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                          return `${hours}h ${minutes}m`
                        })()
                      : 'In Progress'

                    return (
                      <div
                        key={clock.id}
                        className="bg-white/5 rounded-lg p-3 border border-white/5 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-2"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white/60 text-xs">
                            {new Date(clock.clock_in).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              clock.clock_out
                                ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                                : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {clock.clock_out ? 'Completed' : 'Active'}
                          </span>
                        </div>
                        <div className="text-xs text-white/70 space-y-1">
                          <div className="flex justify-between">
                            <span>In:</span>
                            <span>
                              {new Date(clock.clock_in).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Out:</span>
                            <span>
                              {clock.clock_out
                                ? new Date(clock.clock_out).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })
                                : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/5">
                            <span>Duration:</span>
                            <span className="text-white/90">{duration}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white/90">{user.team?.name} - Team Members</DialogTitle>
          </DialogHeader>
          {user.team && user.team.members && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {user.team.members.map(
                (member: { id: number; first_name: string; last_name: string; email: string }) => {
                  // Get full user data for phone number
                  const fullUser = mockUsers.find((u) => u.id === member.id)

                  // Check if member is currently clocked in
                  const activeClock = mockClocks.find(
                    (c) => c.user_id === member.id && !c.clock_out,
                  )
                  const isActive = !!activeClock

                  return (
                    <div
                      key={member.id}
                      className="group relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-5 hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      {/* Decorative gradient overlay */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <span className="text-white">
                            {member.first_name.charAt(0)}
                            {member.last_name.charAt(0)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white mb-1">
                                {member.first_name} {member.last_name}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full backdrop-blur-sm ${
                                  isActive
                                    ? 'bg-green-500/20 text-green-300 border border-green-400/40 shadow-sm shadow-green-500/20'
                                    : 'bg-slate-500/20 text-slate-300 border border-slate-400/40'
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}
                                />
                                {isActive ? 'Active Now' : 'Offline'}
                              </span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-3 group/item">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                                <Mail className="w-4 h-4 text-blue-300" />
                              </div>
                              <span className="text-white/80 text-sm">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-3 group/item">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                                <Phone className="w-4 h-4 text-cyan-300" />
                              </div>
                              <span className="text-white/80 text-sm">
                                {fullUser?.phone_number || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
