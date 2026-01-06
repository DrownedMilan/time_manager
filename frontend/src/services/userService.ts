import { api } from '@/lib/api'
import type { User, UserUpdatePayload } from '@/types/user'
import type { Clock } from '@/types/clock'

export interface UserCreatePayload {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  keycloak_id?: string
  realm_roles?: string[]
}

/**
 * GET /users
 * Return all users
 */
export async function getUsers(authToken?: string | null) {
  return api<User[]>(`/users/`, {
    method: 'GET',
    authToken,
  })
}

/**
 * GET /users/:id
 * Return a user by id
 */
export async function getUserById(userId: number, authToken?: string | null) {
  return api<User>(`/users/${userId}`, {
    method: 'GET',
    authToken,
  })
}

/**
 * POST /users
 * Create a new user
 */
export async function createUser(
  payload: UserCreatePayload,
  authToken?: string | null,
) {
  return api<User>(`/users/`, {
    method: 'POST',
    body: payload,
    authToken,
  })
}

/**
 * PUT /users/:id
 * Update a user
 */
export async function updateUser(
  userId: number,
  payload: UserUpdatePayload,
  authToken?: string | null,
) {
  return api<User>(`/users/${userId}`, {
    method: 'PUT',
    body: payload,
    authToken,
  })
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
  return api<User>(`/users/${userId}`, {
    method: 'DELETE',
    authToken,
  })
}