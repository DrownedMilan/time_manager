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

// Raw response from backend
export interface UserApiResponse {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  created_at: string
  keycloak_id: string
  realm_roles: string[]
  team?: TeamMinimal | null
  managed_team?: TeamMinimal | null  // Add this
}

export interface TeamMinimal {
  id: number
  name: string
  manager?: UserMinimal | null
}

// Parsed user with role derived from realm_roles
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  role: UserRole
  created_at: string
  team: TeamMinimal | null
  managed_team?: TeamMinimal | null
}

export interface UserMinimal {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  realm_roles?: string[]  // From backend
  role?: UserRole         // Parsed role (optional since it may come from realm_roles)
}

export interface UserUpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
}

// Helper to convert realm_roles to UserRole
export function parseUserRole(realm_roles: string[]): UserRole {
  const roles = realm_roles.map((r) => r.toLowerCase())
  if (roles.includes('organization')) return UserRole.ORGANIZATION
  if (roles.includes('manager')) return UserRole.MANAGER
  return UserRole.EMPLOYEE
}

// Helper to convert API response to User
export function parseUser(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    email: apiUser.email,
    phone_number: apiUser.phone_number,
    role: parseUserRole(apiUser.realm_roles),
    created_at: apiUser.created_at,
    team: apiUser.team ?? null,
    managed_team: apiUser.managed_team ?? null,  // Add this
  }
}

// Helper to parse UserMinimal with role derived from realm_roles
export function parseUserMinimal(user: UserMinimal): UserMinimal {
  if (user.role) return user // Already has role
  return {
    ...user,
    role: user.realm_roles ? parseUserRole(user.realm_roles) : UserRole.EMPLOYEE,
  }
}
