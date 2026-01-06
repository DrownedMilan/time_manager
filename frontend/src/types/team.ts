import type { UserMinimal } from './user'

export interface Team {
  id: number
  name: string
  description: string
  manager_id: number | null
  created_at: string
  manager: UserMinimal | null
  members: UserMinimal[]
}

export interface TeamCreatePayload {
  name: string
  description: string
  manager_id: number | null
}

export interface TeamUpdatePayload {
  name: string | null
  description: string | null
  manager_id: number | null
}
