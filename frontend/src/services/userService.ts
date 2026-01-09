import { api } from '@/lib/api'
import type { User, UserUpdatePayload, UserRole } from '@/types/user'
import { UserRole as UserRoleEnum } from '@/types/user'
import type { Clock } from '@/types/clock'

export interface UserCreatePayload {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  keycloak_id?: string
  realm_roles?: string[]
}

// Raw API response type (what backend actually returns)
interface UserApiResponse {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  created_at: string
  keycloak_id: string
  realm_roles: string[]
  team_id: number | null
  team: { id: number; name: string } | null // Backend now returns this
  team: { id: number; name: string } | null // Backend now returns this
  managed_team?: { id: number; name: string } | null
  temp_password?: string | null // Only returned on creation
}

// Convert realm_roles array to single UserRole
function parseUserRole(realm_roles: string[]): UserRole {
  const roles = realm_roles.map((r) => r.toLowerCase())
  if (roles.includes('organization')) return UserRoleEnum.ORGANIZATION
  if (roles.includes('manager')) return UserRoleEnum.MANAGER
  return UserRoleEnum.EMPLOYEE
}

// Convert API response to User type
function parseUser(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    email: apiUser.email,
    phone_number: apiUser.phone_number,
    role: parseUserRole(apiUser.realm_roles || []),
    created_at: apiUser.created_at,
    team: apiUser.team ?? null, // Use team from API directly
    managed_team: apiUser.managed_team ?? null,
  }
}

/**
 * GET /users
 * Return all users
 */
export async function getUsers(authToken?: string | null): Promise<User[]> {
  const response = await api<UserApiResponse[]>(`/users/`, {
    method: 'GET',
    authToken,
  })
  return response.map(parseUser)
}

/**
 * GET /users/:id
 * Return a user by id
 */
export async function getUserById(userId: number, authToken?: string | null): Promise<User> {
  const response = await api<UserApiResponse>(`/users/${userId}`, {
    method: 'GET',
    authToken,
  })
  return parseUser(response)
}

/**
 * POST /users
 * Create a new user
 */
export async function createUser(
  payload: UserCreatePayload,
  authToken?: string | null,
): Promise<{ user: User; tempPassword?: string }> {
  const response = await api<UserApiResponse>(`/users/`, {
    method: 'POST',
    body: payload,
    authToken,
  })
  return {
    user: parseUser(response),
    tempPassword: response.temp_password ?? undefined,
  }
}

/**
 * PUT /users/:id
 * Update a user
 */
export async function updateUser(
  userId: number,
  payload: UserUpdatePayload,
  authToken?: string | null,
): Promise<User> {
  const response = await api<UserApiResponse>(`/users/${userId}`, {
    method: 'PUT',
    body: payload,
    authToken,
  })
  return parseUser(response)
}

/**
 * GET /users/:id/clocks/
 * Return all users clocks
 */
export async function getUserClocks(userId: number, authToken?: string | null) {
  return api<Clock[]>(`/users/${userId}/clocks/`, {
    method: 'GET',
    authToken,
  })
}

/**
 * DELETE /users/:id
 * Deletes a user
 */
export async function deleteUser(userId: number, authToken?: string | null) {
  return api<void>(`/users/${userId}`, {
    method: 'DELETE',
    authToken,
  })
}

export interface PasswordChangePayload {
  current_password: string
  new_password: string
}

/**
 * POST /users/me/change-password
 * Change the password for the currently authenticated user
 */
export async function changePassword(
  payload: PasswordChangePayload,
  authToken?: string | null,
): Promise<{ message: string }> {
  return api<{ message: string }>(`/users/me/change-password`, {
    method: 'POST',
    body: payload,
    authToken,
  })
}

export interface PasswordResetResponse {
  temp_password: string
}

/**
 * POST /users/:id/reset-password
 * Reset a user's password to a temporary password (organization/manager only)
 */
export async function resetUserPassword(
  userId: number,
  authToken?: string | null,
): Promise<PasswordResetResponse> {
  return api<PasswordResetResponse>(`/users/${userId}/reset-password`, {
    method: 'POST',
    authToken,
  })
}
