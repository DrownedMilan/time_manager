import { api } from '@/lib/http'
import type { Clock } from '@/types/clock'

export interface ClockCreateRequest {
  user_id: number
}

export const clocksService = {
  // POST /clocks
  // Clock in, clock out
  async clockInOut(user_id: number): Promise<Clock> {
    return await api.post<Clock>('/clocks/', { user_id })
  },
	// GET /users/${user_id}/clocks/
  // All user clocks
  async getUserClocks(user_id: number): Promise<Clock[]> {
    return await api.get<Clock[]>(`/users/${user_id}/clocks/`)
  },
	// GET /clocks/${clock_id}
  // One clock
  async getUserClock(clock_id: number): Promise<Clock> {
    return await api.get<Clock>(`/clocks/${clock_id}`)
  },
}
