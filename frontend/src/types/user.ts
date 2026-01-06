import type { Team } from './team'
import type { Clock } from './clock'

export const UserRole = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  ORGANIZATION: 'Organization',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface AuthUser {
  keycloak_id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
}

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  role: UserRole
  created_at: string
  team: TeamMinimal | null
}


export interface UserMinimal {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  role: UserRole
}

export interface UserUpdatePayload {
  first_name: string | null
  last_name: string | null
  email: string
  phone_number: string | null
}
