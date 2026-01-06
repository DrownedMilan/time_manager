import { api } from '@/lib/api'
import type { Team, TeamCreatePayload, TeamUpdatePayload } from '../types/team'

/**
 * POST /teams
 * Create a team
 */
export async function createTeam(payload: TeamCreatePayload, authToken?: string | null) {
  return api<Team>(`/teams/`, {
    method: 'POST',
    authToken,
    body: payload,
  })
}

/**
 * GET /teams
 * Return all teams
 */
export async function getTeams(authToken?: string | null) {
  return api<Team[]>(`/teams/`, {
    method: 'GET',
    authToken,
  })
}

/**
 * GET /teams/:id
 * Return a single team by id
 */
export async function getTeamById(teamId: number, authToken?: string | null) {
  return api<Team>(`/teams/${teamId}`, {
    method: 'GET',
    authToken,
  })
}

/**
 * PUT /teams/:id
 * Updates a team
 */
export async function updateTeam(
  payload: TeamUpdatePayload,
  teamId: number,
  authToken?: string | null,
) {
  return api<Team>(`/teams/${teamId}`, {
    method: 'PUT',
    authToken,
    body: payload,
  })
}

/**
 * POST /teams/:teamid/members/:userid
 * Assigns a member to a team
 */
export async function addMemberToTeam(teamId: number, userId: number, authToken?: string | null) {
  return api<Team>(`/teams/${teamId}/members/${userId}`, {
    method: 'POST',
    authToken,
  })
}

/**
 * DELETE /teams/:teamid/members/:userid
 * Removes a member from a team
 */
export async function removeMemberFromTeam(
  teamId: number,
  userId: number,
  authToken?: string | null,
) {
  return api<Team>(`/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    authToken,
  })
}

/**
 * DELETE /teams/:id
 * Deletes a team
 */
export async function deleteTeam(teamId: number, authToken?: string | null) {
  return api<Team>(`/teams/${teamId}`, {
    method: 'DELETE',
    authToken,
  })
}