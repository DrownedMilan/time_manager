import type { UserMinimal } from './user'

export interface Clock {
  id: number
  user_id: number
  clock_in: string
  clock_out: string | null
  user: UserMinimal | null
  created_at: string
}

export interface ClockInOutCreatePayload {
  user_id: number
}
