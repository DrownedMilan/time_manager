import type { User } from './user'

export interface Clock {
  id: number
  clock_in: Date
  clock_out: Date | null
  user: User
}
