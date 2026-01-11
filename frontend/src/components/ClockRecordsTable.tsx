import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { Clock } from '../types/clock'
import type { User } from '../types/user'
import { Clock as ClockIcon } from 'lucide-react'
import EmployeeDetailView from '../features/employees/EmployeeDetailView'
import { getUserById } from '../services/userService'
import { useAuth } from '../hooks/useAuth'

interface ClockRecordsTableProps {
  clocks: Clock[]
  showUser?: boolean
}

export default function ClockRecordsTable({ clocks, showUser = true }: ClockRecordsTableProps) {
  const { keycloak } = useAuth()
  const token = keycloak?.token ?? null
  const [dateFilter, setDateFilter] = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 'In Progress'

    const start = new Date(clockIn)
    const end = new Date(clockOut)
    const diff = end.getTime() - start.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleEmployeeClick = async (userId: string) => {
    if (!token) {
      console.error('No auth token available')
      return
    }
    try {
      const fullUser = await getUserById(Number(userId), token)
      setSelectedEmployee(fullUser)
      setIsDetailOpen(true)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  // Extract unique values for dropdown filters
  const uniqueDates = useMemo(() => {
    const dates = new Set(clocks.map((clock) => formatDate(clock.clock_in)))
    return Array.from(dates).sort()
  }, [clocks])

  const uniqueEmployees = useMemo(() => {
    if (!showUser) return []
    const employees = new Set(
      clocks
        .filter((clock) => clock.user)
        .map((clock) => `${clock.user!.first_name} ${clock.user!.last_name}`),
    )
    return Array.from(employees).sort()
  }, [clocks, showUser])

  // Filter clocks based on filter values
  const filteredClocks = clocks.filter((clock) => {
    const dateMatch = dateFilter === 'all' || formatDate(clock.clock_in) === dateFilter

    const employeeMatch =
      !showUser ||
      employeeFilter === 'all' ||
      (clock.user && `${clock.user.first_name} ${clock.user.last_name}` === employeeFilter)

    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !clock.clock_out) ||
      (statusFilter === 'completed' && clock.clock_out)

    return dateMatch && employeeMatch && statusMatch
  })

  if (clocks.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <ClockIcon className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60">No clock records found</p>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 bg-white/5">
            <TableHead className="p-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">
                    All Dates
                  </SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date} className="text-white">
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            {showUser && (
              <TableHead className="p-2">
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="all" className="text-white">
                      All Employees
                    </SelectItem>
                    {uniqueEmployees.map((employee) => (
                      <SelectItem key={employee} value={employee} className="text-white">
                        {employee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
            )}
            <TableHead className="p-2 text-white/80">Clock In</TableHead>
            <TableHead className="p-2 text-white/80">Clock Out</TableHead>
            <TableHead className="p-2 text-white/80">Duration</TableHead>
            <TableHead className="p-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="active" className="text-white">
                    Active
                  </SelectItem>
                  <SelectItem value="completed" className="text-white">
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClocks.map((clock) => (
            <TableRow key={clock.id} className="border-white/10 hover:bg-white/5">
              <TableCell className="text-white/90">{formatDate(clock.clock_in)}</TableCell>
              {showUser && clock.user && (
                <TableCell
                  className="text-white/90 cursor-pointer hover:text-blue-300 transition-colors"
                  onClick={() => handleEmployeeClick(String(clock.user!.id))}
                >
                  {clock.user.first_name} {clock.user.last_name}
                </TableCell>
              )}
              <TableCell className="text-white/70">{formatTime(clock.clock_in)}</TableCell>
              <TableCell className="text-white/70">
                {clock.clock_out ? formatTime(clock.clock_out) : '-'}
              </TableCell>
              <TableCell className="text-white/70">
                {calculateDuration(clock.clock_in, clock.clock_out)}
              </TableCell>
              <TableCell>
                {clock.clock_out ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 border-green-500/30 text-green-300"
                  >
                    Completed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 border-blue-500/30 text-blue-300"
                  >
                    Active
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EmployeeDetailView
        user={selectedEmployee}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
