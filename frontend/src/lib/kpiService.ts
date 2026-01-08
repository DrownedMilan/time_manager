import { api } from '@/lib/api'

export type KPISummary = {
  totalEmployees: number
  totalTeams: number
  totalHoursThisWeek: number
  avgHoursPerShift: number
  avgLateTimeMinutes: number
  avgOvertimeHours: number
}

/**
 * Appelle GET /api/kpi/summary
 */
export function getKpiSummary(authToken: string) {
  return api<KPISummary>('/kpi/summary', {
    authToken,
  })
}
