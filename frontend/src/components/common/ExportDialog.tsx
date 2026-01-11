import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Download, FileSpreadsheet } from 'lucide-react'
import { mockUsers, mockTeams, mockClocks } from '../../lib/mockData'
import { UserRole } from '@/types/user'
import { formatLateTime } from '@/lib/formatTime'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: UserRole
  // KPI data passed from parent dashboard
  kpiData?: {
    totalEmployees?: number
    totalTeams?: number
    activeClocks?: number
    totalHoursThisWeek?: number
    avgHoursPerShift?: number
    avgLateTime?: number
    avgOvertime?: number
    teamName?: string // For manager dashboard
  }
}

export default function ExportDialog({
  open,
  onOpenChange,
  userRole,
  kpiData = {},
}: ExportDialogProps) {
  const [selectedSections, setSelectedSections] = useState({
    kpis: true,
    teamInfo: true,
    clockRecords: true,
  })

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const generateCSV = () => {
    let csvContent = ''
    const timestamp = new Date().toISOString().split('T')[0]

    // Add header
    csvContent += `Bank Clocking System Export\n`
    csvContent += `Generated: ${new Date().toLocaleString()}\n`
    csvContent += `Role: ${userRole}\n\n`

    // KPIs Section
    if (selectedSections.kpis && kpiData) {
      csvContent += '=== KEY PERFORMANCE INDICATORS ===\n'

      if (userRole === UserRole.ORGANIZATION) {
        if (kpiData.totalEmployees !== undefined)
          csvContent += `Total Employees,${kpiData.totalEmployees}\n`
        if (kpiData.totalTeams !== undefined) csvContent += `Total Teams,${kpiData.totalTeams}\n`
        if (kpiData.activeClocks !== undefined)
          csvContent += `Currently Active,${kpiData.activeClocks}\n`
        if (kpiData.totalHoursThisWeek !== undefined)
          csvContent += `Total Hours This Week (per employee),${kpiData.totalHoursThisWeek.toFixed(1)}h\n`
        if (kpiData.avgHoursPerShift !== undefined)
          csvContent += `Avg Hours Per Shift,${kpiData.avgHoursPerShift.toFixed(1)}h\n`
        if (kpiData.avgLateTime !== undefined)
          csvContent += `Avg Late Time,${formatLateTime(kpiData.avgLateTime)}\n`
        if (kpiData.avgOvertime !== undefined)
          csvContent += `Avg Overtime,${kpiData.avgOvertime.toFixed(1)}h\n`
      } else if (userRole === UserRole.MANAGER) {
        if (kpiData.teamName) csvContent += `Team Name,${kpiData.teamName}\n`
        if (kpiData.totalEmployees !== undefined)
          csvContent += `Team Members,${kpiData.totalEmployees}\n`
        if (kpiData.activeClocks !== undefined)
          csvContent += `Currently Active,${kpiData.activeClocks}\n`
        if (kpiData.avgHoursPerShift !== undefined)
          csvContent += `Avg Hours Per Shift,${kpiData.avgHoursPerShift.toFixed(1)}h\n`
        if (kpiData.avgLateTime !== undefined)
          csvContent += `Avg Late Time,${formatLateTime(kpiData.avgLateTime)}\n`
        if (kpiData.avgOvertime !== undefined)
          csvContent += `Avg Overtime,${kpiData.avgOvertime.toFixed(1)}h\n`
      }
      csvContent += '\n'
    }

    // Team Info Section
    if (selectedSections.teamInfo) {
      csvContent += '=== TEAM INFORMATION ===\n'
      csvContent += 'Team Name,Description,Manager,Manager Email,Member Count\n'

      const teamsToExport =
        userRole === UserRole.MANAGER
          ? mockTeams.filter((team) =>
              mockUsers.find((u) => u.managed_team?.id === team.id && u.role === UserRole.MANAGER),
            )
          : mockTeams

      teamsToExport.forEach((team) => {
        const managerName = team.manager
          ? `${team.manager.first_name} ${team.manager.last_name}`
          : 'Unknown Manager'

        const managerEmail = team.manager?.email ?? 'N/A'

        const memberCount = team.members?.length ?? 0

        csvContent += `"${team.name}","${team.description || ''}",${managerName},${managerEmail},${memberCount}\n`
      })
      csvContent += '\n'
    }

    // Clock Records Section
    if (selectedSections.clockRecords) {
      csvContent += '=== CLOCK RECORDS ===\n'
      csvContent += 'Employee Name,Email,Clock In,Clock Out,Duration (hours),Status,Late,Overtime\n'

      const clocksToExport =
        userRole === UserRole.MANAGER
          ? mockClocks.filter((clock) => {
              const user = mockUsers.find((u) => u.id === clock.user_id)
              return (
                user?.team?.manager_id === mockUsers.find((u) => u.role === UserRole.MANAGER)?.id
              )
            })
          : mockClocks

      clocksToExport.forEach((clock) => {
        const userName = clock.user
          ? `${clock.user.first_name} ${clock.user.last_name}`
          : 'Unknown User'

        const userEmail = clock.user?.email ?? 'N/A'

        const clockIn = new Date(clock.clock_in).toLocaleString()
        const clockOut = clock.clock_out
          ? new Date(clock.clock_out).toLocaleString()
          : 'Not clocked out'

        let duration = 'N/A'
        let isLate = 'No'
        let hasOvertime = 'No'

        if (clock.clock_out) {
          const durationMs =
            new Date(clock.clock_out).getTime() - new Date(clock.clock_in).getTime()

          duration = (durationMs / (1000 * 60 * 60)).toFixed(2)
        }

        // Check if late (after 9:00 AM)
        const clockInTime = new Date(clock.clock_in)
        if (
          clockInTime.getHours() > 9 ||
          (clockInTime.getHours() === 9 && clockInTime.getMinutes() > 0)
        ) {
          isLate = 'Yes'
        }

        // Check overtime (after 17:00)
        if (clock.clock_out) {
          const clockOutTime = new Date(clock.clock_out)
          if (
            clockOutTime.getHours() > 17 ||
            (clockOutTime.getHours() === 17 && clockOutTime.getMinutes() > 0)
          ) {
            hasOvertime = 'Yes'
          }
        }

        const status = clock.clock_out ? 'Completed' : 'Active'

        csvContent += `"${userName}",${userEmail},"${clockIn}","${clockOut}",${duration},${status},${isLate},${hasOvertime}\n`
      })
      csvContent += '\n'
    }

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clocking_export_${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onOpenChange(false)
  }

  const hasSelection =
    selectedSections.kpis || selectedSections.teamInfo || selectedSections.clockRecords

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Export as CSV
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Select the data you want to export to a CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Checkbox
              id="kpis"
              checked={selectedSections.kpis}
              onCheckedChange={() => toggleSection('kpis')}
              className="mt-0.5 border-white/20 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
            />
            <div className="flex-1">
              <Label htmlFor="kpis" className="text-white cursor-pointer">
                Key Performance Indicators
              </Label>
              <p className="text-xs text-white/60 mt-1">
                Statistics like total hours, avg shift time, late time, overtime
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Checkbox
              id="teamInfo"
              checked={selectedSections.teamInfo}
              onCheckedChange={() => toggleSection('teamInfo')}
              className="mt-0.5 border-white/20 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
            />
            <div className="flex-1">
              <Label htmlFor="teamInfo" className="text-white cursor-pointer">
                Team Information
              </Label>
              <p className="text-xs text-white/60 mt-1">
                Team names, descriptions, managers, and member counts
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Checkbox
              id="clockRecords"
              checked={selectedSections.clockRecords}
              onCheckedChange={() => toggleSection('clockRecords')}
              className="mt-0.5 border-white/20 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
            />
            <div className="flex-1">
              <Label htmlFor="clockRecords" className="text-white cursor-pointer">
                Clock Records
              </Label>
              <p className="text-xs text-white/60 mt-1">
                All clock in/out records with durations and status
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={generateCSV}
            disabled={!hasSelection}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
