import { useCallback, useEffect, useState } from 'react'
import { getClocks } from '@/services/clockService'
import type { Clock } from '../types/clock'

interface UseClockResult {
  data: Clock[] | null
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

export function useClocks(authToken?: string | null): UseClockResult {
  const [data, setData] = useState<Clock[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  // simple version; re-run when teamId or authToken changes
  const load = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const clocks = await getClocks(authToken)
      setData(clocks)
    } catch (err) {
      console.error('Failed to fetch team:', err)
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
