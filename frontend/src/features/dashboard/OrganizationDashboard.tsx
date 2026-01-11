import { useEffect, useState, useCallback } from 'react'
import { getKpiSummary, type KPISummary } from '@/lib/kpiService'
import { kpisApi } from '@/lib/kpiApi'
import StatCard from '../../components/common/StatCard'
import UsersTable from '../../components/UsersTable'
import TeamsTable from '../teams/TeamsTable'
import TeamDetailView from '../teams/TeamDetailView'
import AddTeamDialog from '../teams/AddTeamDialog'
import EmployeeEditDialog from '../employees/EmployeeEditDialog'
import EmployeeDetailView from '../employees/EmployeeDetailView'
import TeamEditDialog from '../teams/TeamEditDialog'
import EmployeeRankingDialog from '../employees/EmployeeRankingDialog'
import ExportDialog from '../../components/common/ExportDialog'
import {
  Users,
  Building2,
  Clock,
  TrendingUp,
  Plus,
  Timer,
  Award,
  Download,
  Loader2,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import type { User } from '@/types/user'
import type { Team } from '@/types/team'
import type { Clock as ClockType } from '@/types/clock'
import { useAuth } from '@/hooks/useAuth'
import { getUsers, deleteUser } from '@/services/userService'
import { getTeams } from '@/services/teamService'
import { getClocks } from '@/services/clockService'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'

export default function OrganizationDashboard() {
  const { user } = useUser()

  useEffect(() => {
    // USERS
    kpisApi
      .users()
      .then((data) => console.log('✅ USERS API:', data))
      .catch((err) => console.error('❌ USERS API error:', err))

    // TEAMS
    kpisApi
      .teams()
      .then((data) => console.log('✅ TEAMS API:', data))
      .catch((err) => console.error('❌ TEAMS API error:', err))

    // CLOCKS
    kpisApi
      .clocks()
      .then((data) => console.log('✅ CLOCKS API:', data))
      .catch((err) => console.error('❌ CLOCKS API error:', err))
  }, [])

  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null

  // State for API data
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [clocks, setClocks] = useState<ClockType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // KPI API states
  const [isKpiDownloading, setIsKpiDownloading] = useState(false)
  const [kpiApi, setKpiApi] = useState<KPISummary | null>(null)

  // UI state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false)
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [isEmployeeEditOpen, setIsEmployeeEditOpen] = useState(false)
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<User | null>(null)
  const [isEmployeeDetailOpen, setIsEmployeeDetailOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isTeamEditOpen, setIsTeamEditOpen] = useState(false)
  const [metricDialogOpen, setMetricDialogOpen] = useState<
    'workTime' | 'lateTime' | 'overtime' | null
  >(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  // Fetch all data from APIs
  const fetchData = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const [fetchedUsers, fetchedTeams, fetchedClocks] = await Promise.all([
        getUsers(token),
        getTeams(token),
        getClocks(token),
      ])
      setUsers(fetchedUsers)
      setTeams(fetchedTeams)
      setClocks(fetchedClocks)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!user) return <div>Loading...</div>

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        <span className="ml-3 text-white/60">Loading dashboard...</span>
      </div>
    )
  }

  // =====================
  // Base KPI data sources (local)
  // =====================
  const totalUsers = users.length
  const totalTeams = teams.length
  const activeClocks = clocks.filter((c) => !c.clock_out).length

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team)
    setIsTeamDetailOpen(true)
  }

  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee)
    setIsEmployeeEditOpen(true)
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setIsTeamEditOpen(true)
  }

  const handleDeleteEmployee = async (userId: number) => {
    try {
      await deleteUser(userId, token)
      // Remove the user from local state instead of refetching all data
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      // Also remove their clocks from local state
      setClocks((prevClocks) => prevClocks.filter((clock) => clock.user_id !== userId))
      toast.success('Employee deleted successfully')
    } catch (error) {
      console.error('Failed to delete employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  const totalHoursThisWeek = clocks.reduce((acc, clock) => {
    if (clock.clock_out) {
      const diff = new Date(clock.clock_out).getTime() - new Date(clock.clock_in).getTime()
      return acc + diff / (1000 * 60 * 60)
    }
    return acc
  }, 0)

  // Average total hours per employee (week)
  const avgTotalHours = totalUsers > 0 ? totalHoursThisWeek / totalUsers : 0

  // Average shift duration (completed clocks only)
  const completedClocks = clocks.filter((c) => c.clock_out)
  const avgWorkTime =
    completedClocks.length > 0
      ? completedClocks.reduce((acc, clock) => {
          const diff = new Date(clock.clock_out!).getTime() - new Date(clock.clock_in).getTime()
          return acc + diff / (1000 * 60 * 60)
        }, 0) / completedClocks.length
      : 0

  // Average late time (after 09:00)
  const lateClocks = clocks.filter((c) => {
    const clockInTime = new Date(c.clock_in)
    const hours = clockInTime.getHours()
    const minutes = clockInTime.getMinutes()
    return hours > 9 || (hours === 9 && minutes > 0)
  })

  const avgLateTime =
    lateClocks.length > 0
      ? lateClocks.reduce((acc, clock) => {
          const clockInTime = new Date(clock.clock_in)
          const scheduledStart = new Date(clockInTime)
          scheduledStart.setHours(9, 0, 0, 0)
          const lateDiff = clockInTime.getTime() - scheduledStart.getTime()
          return acc + lateDiff / (1000 * 60)
        }, 0) / lateClocks.length
      : 0

  // Average overtime hours (after 17:00)
  const overtimeClocks = completedClocks.filter((c) => {
    const clockOutTime = new Date(c.clock_out!)
    const hours = clockOutTime.getHours()
    const minutes = clockOutTime.getMinutes()
    return hours > 17 || (hours === 17 && minutes > 0)
  })

  const avgOvertimeHours =
    overtimeClocks.length > 0
      ? overtimeClocks.reduce((acc, clock) => {
          const clockOutTime = new Date(clock.clock_out!)
          const scheduledEnd = new Date(clockOutTime)
          scheduledEnd.setHours(17, 0, 0, 0)
          const overtimeDiff = clockOutTime.getTime() - scheduledEnd.getTime()
          return acc + overtimeDiff / (1000 * 60 * 60)
        }, 0) / overtimeClocks.length
      : 0

  // =====================
  // Ranking helpers
  // =====================
  const calculateEmployeeWorkTime = () => {
    const userMetrics = users.map((u) => {
      const userClocks = clocks.filter((c) => c.user_id === u.id && c.clock_out)
      const totalWorkTime = userClocks.reduce((acc, clock) => {
        const diff = new Date(clock.clock_out!).getTime() - new Date(clock.clock_in).getTime()
        return acc + diff / (1000 * 60 * 60)
      }, 0)
      const avg = userClocks.length > 0 ? totalWorkTime / userClocks.length : 0
      return { user: u, value: avg, displayValue: `${avg.toFixed(1)}h` }
    })
    return userMetrics.sort((a, b) => b.value - a.value)
  }

  const calculateEmployeeLateTime = () => {
    const userMetrics = users.map((u) => {
      const userClocks = clocks.filter((c) => {
        if (c.user_id !== u.id) return false
        const clockInTime = new Date(c.clock_in)
        const hours = clockInTime.getHours()
        const minutes = clockInTime.getMinutes()
        return hours > 9 || (hours === 9 && minutes > 0)
      })

      const totalLateTime = userClocks.reduce((acc, clock) => {
        const clockInTime = new Date(clock.clock_in)
        const scheduledStart = new Date(clockInTime)
        scheduledStart.setHours(9, 0, 0, 0)
        const lateDiff = clockInTime.getTime() - scheduledStart.getTime()
        return acc + lateDiff / (1000 * 60)
      }, 0)

      const avg = userClocks.length > 0 ? totalLateTime / userClocks.length : 0
      return { user: u, value: avg, displayValue: `${avg.toFixed(0)} min` }
    })
    return userMetrics.sort((a, b) => b.value - a.value)
  }

  const calculateEmployeeOvertime = () => {
    const userMetrics = users.map((u) => {
      const userClocks = clocks.filter((c) => {
        if (c.user_id !== u.id || !c.clock_out) return false
        const clockOutTime = new Date(c.clock_out)
        const hours = clockOutTime.getHours()
        const minutes = clockOutTime.getMinutes()
        return hours > 17 || (hours === 17 && minutes > 0)
      })

      const totalOvertime = userClocks.reduce((acc, clock) => {
        const clockOutTime = new Date(clock.clock_out!)
        const scheduledEnd = new Date(clockOutTime)
        scheduledEnd.setHours(17, 0, 0, 0)
        const overtimeDiff = clockOutTime.getTime() - scheduledEnd.getTime()
        return acc + overtimeDiff / (1000 * 60 * 60)
      }, 0)

      const avg = userClocks.length > 0 ? totalOvertime / userClocks.length : 0
      return { user: u, value: avg, displayValue: `${avg.toFixed(1)}h` }
    })
    return userMetrics.sort((a, b) => b.value - a.value)
  }

  // =====================
  // Chart data
  // =====================
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const now = new Date()
    const currentDayOfWeek = now.getDay()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1))
    startOfWeek.setHours(0, 0, 0, 0)

    return days.map((day, index) => {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + index)

      const dayClocks = clocks.filter((c) => {
        const clockDate = new Date(c.clock_in)
        return clockDate.toDateString() === dayDate.toDateString()
      })

      const hours = dayClocks.reduce((acc, clock) => {
        if (clock.clock_out) {
          const diff = new Date(clock.clock_out).getTime() - new Date(clock.clock_in).getTime()
          return acc + diff / (1000 * 60 * 60)
        }
        return acc
      }, 0)

      const uniqueEmployees = new Set(dayClocks.map((c) => c.user_id)).size

      return { day, hours: parseFloat(hours.toFixed(1)), employees: uniqueEmployees }
    })
  }

  const chartData = generateChartData()

  // =====================
  // CSV Export helpers
  // =====================
  const CSV_SEPARATOR = ';'
  const isoDate = () => new Date().toISOString().slice(0, 10)

  const escapeCsv = (value: any) => {
    const s = String(value ?? '')
    if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const rowsToCsvExcel = (rows: Record<string, any>[]) => {
    if (!rows.length) return '\uFEFF' + `sep=${CSV_SEPARATOR}\n`

    const headers = Object.keys(rows[0])
    const headerLine = headers.map(escapeCsv).join(CSV_SEPARATOR)
    const dataLines = rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(CSV_SEPARATOR))

    return '\uFEFF' + `sep=${CSV_SEPARATOR}\n` + [headerLine, ...dataLines].join('\n')
  }

  const downloadCsvExcel = (filename: string, rows: Record<string, any>[]) => {
    const csv = rowsToCsvExcel(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  }

  // KPI API download
  const handleDownloadKpiCsv = async () => {
    if (!token) {
      toast.error('Missing auth token')
      return
    }

    setIsKpiDownloading(true)
    try {
      const summary = await getKpiSummary(token)
      setKpiApi(summary)

      const today = isoDate()

      // 1. KPI Summary CSV
      downloadCsvExcel(`kpi-${today}.csv`, [summary])

      // 2. Teams CSV
      const teamsData = teams.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        manager_id: t.manager_id ?? '',
        manager_name: t.manager ? `${t.manager.first_name} ${t.manager.last_name}` : '',
        members_count: t.members?.length ?? 0,
        member_names: t.members?.map((m) => `${m.first_name} ${m.last_name}`).join(', ') ?? '',
        created_at: t.created_at,
      }))
      downloadCsvExcel(`teams-${today}.csv`, teamsData)

      // 3. Users with Clock Info CSV
      const usersWithClockData = users.map((u) => {
        const userClocks = clocks.filter((c) => c.user_id === u.id)
        const completedClocks = userClocks.filter((c) => c.clock_out)

        // Total hours worked
        const totalHours = completedClocks.reduce((acc, c) => {
          const diff = new Date(c.clock_out!).getTime() - new Date(c.clock_in).getTime()
          return acc + diff / (1000 * 60 * 60)
        }, 0)

        // Average hours per shift
        const avgHoursPerShift =
          completedClocks.length > 0 ? totalHours / completedClocks.length : 0

        // Late arrivals (after 9:00)
        const lateArrivals = userClocks.filter((c) => {
          const clockIn = new Date(c.clock_in)
          return clockIn.getHours() > 9 || (clockIn.getHours() === 9 && clockIn.getMinutes() > 0)
        }).length

        // Overtime sessions (after 17:00)
        const overtimeSessions = completedClocks.filter((c) => {
          const clockOut = new Date(c.clock_out!)
          return (
            clockOut.getHours() > 17 || (clockOut.getHours() === 17 && clockOut.getMinutes() > 0)
          )
        }).length

        return {
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          phone_number: u.phone_number ?? '',
          role: u.role,
          team: u.team?.name || u.managed_team?.name || '',
          total_clock_entries: userClocks.length,
          completed_shifts: completedClocks.length,
          total_hours_worked: Number(totalHours.toFixed(2)),
          avg_hours_per_shift: Number(avgHoursPerShift.toFixed(2)),
          late_arrivals: lateArrivals,
          overtime_sessions: overtimeSessions,
          created_at: u.created_at,
        }
      })
      downloadCsvExcel(`users-clock-info-${today}.csv`, usersWithClockData)

      toast.success('All CSV files exported successfully!')
    } catch (error) {
      console.error('Failed to export CSV:', error)
      toast.error('Failed to export CSV')
    } finally {
      setIsKpiDownloading(false)
    }
  }

  const handleSaveEmployee = (savedUser: User, isNew: boolean) => {
    if (isNew) {
      // Add new user to the list
      setUsers((prevUsers) => [...prevUsers, savedUser])
      // Set the newly created user as selected so the form switches to edit mode
      // This prevents trying to create the same user again
      setSelectedEmployee(savedUser)
    } else {
      // Update existing user in the list
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === savedUser.id ? savedUser : u)))
    }
  }

  const handleTeamCreated = (newTeam: Team, memberIds: number[], managerId: number) => {
    // Build the team with proper member info
    const teamMembers = users
      .filter((u) => memberIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
      }))

    const manager = users.find((u) => u.id === managerId)

    const fullTeam: Team = {
      ...newTeam,
      members: teamMembers,
      manager: manager
        ? {
            id: manager.id,
            first_name: manager.first_name,
            last_name: manager.last_name,
            email: manager.email,
          }
        : null,
    }

    const teamMinimal = { id: fullTeam.id, name: fullTeam.name, manager: fullTeam.manager }

    // Update teams state with the full team
    setTeams((prevTeams) => [...prevTeams, fullTeam])

    // Update users state to reflect team assignments
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        // Manager gets managed_team set
        if (u.id === managerId) {
          return {
            ...u,
            managed_team: teamMinimal,
          }
        }
        // Members get team set
        if (memberIds.includes(u.id)) {
          return {
            ...u,
            team: teamMinimal,
          }
        }
        return u
      }),
    )
  }

  // Handler for when a team is updated (manager changed, members added/removed)
  const handleTeamUpdated = (
    updatedTeam: Team,
    addedMemberIds: number[],
    removedMemberIds: number[],
    newManagerId: number | null,
    oldManagerId: number | null,
  ) => {
    const teamMinimal = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      manager: updatedTeam.manager,
    }

    // Update teams state
    setTeams((prevTeams) => prevTeams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)))

    // Update users state
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        // Handle manager changes
        if (oldManagerId && u.id === oldManagerId && oldManagerId !== newManagerId) {
          // Old manager loses managed_team
          return { ...u, managed_team: null }
        }
        if (newManagerId && u.id === newManagerId) {
          // New manager gets managed_team
          return { ...u, managed_team: teamMinimal }
        }

        // Handle member removals
        if (removedMemberIds.includes(u.id)) {
          return { ...u, team: null }
        }

        // Handle member additions
        if (addedMemberIds.includes(u.id)) {
          return { ...u, team: teamMinimal }
        }

        // Update team name for existing members if name changed
        if (u.team?.id === updatedTeam.id) {
          return { ...u, team: teamMinimal }
        }
        if (u.managed_team?.id === updatedTeam.id) {
          return { ...u, managed_team: teamMinimal }
        }

        return u
      }),
    )
  }

  // Handler for when a team is deleted
  const handleTeamDeleted = (teamId: number) => {
    // Remove team from teams state
    setTeams((prevTeams) => prevTeams.filter((t) => t.id !== teamId))

    // Clear team/managed_team from all users who were part of this team
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        const updated = { ...u }
        if (u.team?.id === teamId) {
          updated.team = null
        }
        if (u.managed_team?.id === teamId) {
          updated.managed_team = null
        }
        return updated
      }),
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-white/90 mb-2">Organization Dashboard</h2>

        <div className="flex gap-3">
          <Button
            onClick={handleDownloadKpiCsv}
            disabled={isKpiDownloading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
          >
            {isKpiDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading KPI...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {kpiApi && (
        <div className="mb-4 text-sm text-white/60">
          KPI API → Employees: {kpiApi.totalEmployees} · Teams: {kpiApi.totalTeams} · Active:{' '}
          {kpiApi.activeClocks} · Week Hours: {kpiApi.totalHoursThisWeek}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={totalUsers}
          icon={Users}
          description="Active users"
          trend={{ value: '5.2%', positive: true }}
        />
        <StatCard title="Teams" value={totalTeams} icon={Building2} description="Departments" />
        <StatCard
          title="Active Now"
          value={activeClocks}
          icon={TrendingUp}
          description="Currently clocked in"
        />
        <StatCard
          title="Total Hours This Week"
          value={`${avgTotalHours.toFixed(1)}h`}
          icon={Clock}
          description="Per employee average"
          trend={{ value: '8.7%', positive: true }}
        />
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Avg Hours Per Shift"
          value={`${avgWorkTime.toFixed(1)}h`}
          icon={Clock}
          description="Average shift duration"
          onClick={() => setMetricDialogOpen('workTime')}
        />
        <StatCard
          title="Avg Late Time"
          value={`${avgLateTime.toFixed(0)} min`}
          icon={Timer}
          description="After 9:00 AM"
          onClick={() => setMetricDialogOpen('lateTime')}
        />
        <StatCard
          title="Avg Overtime"
          value={`${avgOvertimeHours.toFixed(1)}h`}
          icon={Award}
          description="After 17:00"
          onClick={() => setMetricDialogOpen('overtime')}
        />
      </div>

      {/* Stacked layout: Tabs and Chart one per line */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Tabs for different views */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 max-h-[27rem] flex flex-col overflow-hidden">
          <Tabs defaultValue="teams" className="w-full flex flex-col h-full">
            <TabsList className="bg-white/5 border border-white/10 backdrop-blur-xl mb-6 flex-shrink-0">
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/70"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/70"
              >
                Employees
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="flex-1 overflow-hidden m-0">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <h3 className="text-white/90">All Employees</h3>
                    <Button
                      onClick={() => {
                        setSelectedEmployee(null)
                        setIsEmployeeEditOpen(true)
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                      Add Employee
                    </Button>
                  </div>
                  <p className="text-sm text-white/60">{totalUsers} total</p>
                </div>
                <div className="overflow-y-auto flex-1">
                  <UsersTable
                    users={users}
                    onEditUser={handleEditEmployee}
                    onViewDetail={(user) => {
                      setSelectedEmployeeForDetail(user)
                      setIsEmployeeDetailOpen(true)
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <h3 className="text-white/90">All Teams</h3>
                    <Button
                      onClick={() => setIsAddTeamDialogOpen(true)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                      Add Team
                    </Button>
                  </div>
                  <p className="text-sm text-white/60">{totalTeams} total</p>
                </div>
                <div className="overflow-y-auto flex-1">
                  <TeamsTable
                    teams={teams}
                    onTeamClick={handleTeamClick}
                    onEditTeam={handleEditTeam}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Analytics Chart */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white/90 mb-4">Weekly Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)' }}
                />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Total Hours"
                />
                <Line
                  type="monotone"
                  dataKey="employees"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Active Employees"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Detail View */}
      <TeamDetailView
        team={selectedTeam}
        open={isTeamDetailOpen}
        onOpenChange={setIsTeamDetailOpen}
      />

      {/* Add Team Dialog */}
      <AddTeamDialog
        open={isAddTeamDialogOpen}
        onOpenChange={setIsAddTeamDialogOpen}
        onTeamCreated={handleTeamCreated}
      />

      {/* Employee Edit Dialog */}
      <EmployeeEditDialog
        user={selectedEmployee}
        open={isEmployeeEditOpen}
        onOpenChange={setIsEmployeeEditOpen}
        onDelete={handleDeleteEmployee}
        onSave={handleSaveEmployee}
      />

      {/* Employee Detail View */}
      <EmployeeDetailView
        user={selectedEmployeeForDetail}
        open={isEmployeeDetailOpen}
        onOpenChange={setIsEmployeeDetailOpen}
      />

      {/* Team Edit Dialog */}
      <TeamEditDialog
        team={editingTeam}
        open={isTeamEditOpen}
        onOpenChange={setIsTeamEditOpen}
        onTeamUpdated={handleTeamUpdated}
        onDelete={handleTeamDeleted}
      />

      {/* Employee Ranking Dialogs */}
      <EmployeeRankingDialog
        open={metricDialogOpen === 'workTime'}
        onOpenChange={(open) => !open && setMetricDialogOpen(null)}
        title="Average Work Time per Day"
        description="Employees ranked by their average daily work hours"
        employees={calculateEmployeeWorkTime()}
        metricLabel="avg per day"
      />

      <EmployeeRankingDialog
        open={metricDialogOpen === 'lateTime'}
        onOpenChange={(open) => !open && setMetricDialogOpen(null)}
        title="Average Late Time"
        description="Employees ranked by their average late arrival time (after 9:00 AM)"
        employees={calculateEmployeeLateTime()}
        metricLabel="avg late"
      />

      <EmployeeRankingDialog
        open={metricDialogOpen === 'overtime'}
        onOpenChange={(open) => !open && setMetricDialogOpen(null)}
        title="Average Overtime"
        description="Employees ranked by their average overtime hours (after 17:00)"
        employees={calculateEmployeeOvertime()}
        metricLabel="avg overtime"
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        userRole={user.role}
        kpiData={{
          totalEmployees: totalUsers,
          totalTeams: totalTeams,
          activeClocks: activeClocks,
          totalHoursThisWeek: avgTotalHours,
          avgHoursPerShift: avgWorkTime,
          avgLateTime: avgLateTime,
          avgOvertime: avgOvertimeHours,
        }}
      />
    </div>
  )
}
