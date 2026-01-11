import { useCallback, useEffect, useState } from 'react'
import { getTeamById } from '@/services/teamService'
import type { Team } from '../types/team'

interface UseTeamResult {
  data: Team | null
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

export function useTeam(teamId: number | null, authToken?: string | null): UseTeamResult {
  const [data, setData] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  // simple version; re-run when teamId or authToken changes
  const load = useCallback(async () => {
    if (teamId == null) {
      setData(null)
      setIsLoading(true)
      setIsError(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const team = await getTeamById(teamId, authToken)
      setData(team)
    } catch (err) {
      console.error('Failed to fetch team:', err)
      setIsError(true)
      setError(err)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [teamId, authToken])

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: load,
  }
}
