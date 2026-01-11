import { useCallback, useEffect, useState } from 'react'
import { getClockById } from '@/services/clockService'
import type { Clock } from '../types/clock'

interface UseClockResult {
  data: Clock | null
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

export function useClock(clockId: number | null, authToken?: string | null): UseClockResult {
  const [data, setData] = useState<Clock | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  // simple version; re-run when teamId or authToken changes
  const load = useCallback(async () => {
    if (clockId == null) {
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
      const team = await getClockById(clockId, authToken)
      setData(team)
    } catch (err) {
      console.error('Failed to fetch team:', err)
      setIsError(true)
      setError(err)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [clockId, authToken])

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
