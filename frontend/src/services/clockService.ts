import { api } from '@/lib/api'
import type { Clock, ClockInOutCreatePayload } from '@/types/clock'

/**
 * POST /clocks/
 * Clock in/out
 */
export async function createClockInOut(
  payload: ClockInOutCreatePayload,
  authToken?: string | null,
) {
  return (
    api<Clock>(`/clocks/`),
    {
      method: 'POST',
      body: payload,
      authToken,
    }
  )
}

/**
 * GET /clocks
 * Return all clocks
 */
export async function getClocks(authToken?: string | null) {
  return api<Clock[]>(`/clocks/`, {
    method: 'GET',
    authToken,
  })
}

/**
 * GET /clocks/:id
 * Return a clock by id
 */
export async function getClockById(userId: number, authToken?: string | null) {
  return api<Clock>(`/clocks/${userId}`, {
    method: 'GET',
    authToken,
  })
}

// /**
//  * DELETE /clocks/:id
//  * Deletes a clock
//  */
// export async function deleteClock(clockId: number, authToken?: string | null) {
//   return api<Clock>(`/clocks/${clockId}`, {
//     method: 'DELETE',
//     authToken,
//   })
// }