import { api } from './api'
import type { Clock } from '@/types'
import type { User } from '@/types'

type ClockAPI = {
  id: number
  clock_in: string
  clock_out: string | null
  user: User
}

const transformClockData = (clockData: ClockAPI): Clock => ({
  ...clockData,
  clock_in: new Date(clockData.clock_in),
  clock_out: clockData.clock_out ? new Date(clockData.clock_out) : null,
})

export const getUserClocks = async (userId: number): Promise<Clock[]> => {
  try {
    const response = await api.get(`/users/${userId}/clocks/`)
    console.log(response.data)

    const transformedClocks = response.data.map(transformClockData)
    console.log(transformedClocks)
    return transformedClocks
  } catch (error) {
    console.error('[GET] ❌ Error fetching user clocks:', error)
    return []
  }
}

export async function toggleClock(userId: number) {
  try {
    const response = await api.post('/clocks/', { user_id: userId })
    return response.data
  } catch (error) {
    console.error('[POST] ❌ Error while clocking:', error)
    throw error
  }
}
