import { useCallback, useEffect, useState } from 'react'
import { getTeams } from '@/services/teamService'
import type { Team } from '../types/team'

interface UseTeamResult {
  data: Team[] | null
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

export function useTeams(authToken?: string | null): UseTeamResult {
  const [data, setData] = useState<Team[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  // simple version; re-run when teamId or authToken changes
  const load = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const teams = await getTeams(authToken)
      setData(teams)
    } catch (err) {
      console.error('Failed to fetch teams:', err)
      setIsError(true)
      setError(err)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [authToken])

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
