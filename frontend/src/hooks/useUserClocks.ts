import { useCallback, useEffect, useState } from 'react'
import { getUserClocks } from '@/services/userService'
import type { Clock } from '../types/clock'

interface UseClockResult {
  data: Clock[] | null
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

export function useUserClocks(userId: number | null, authToken?: string | null): UseClockResult {
  const [data, setData] = useState<Clock[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async () => {
    // Guard: don't fetch if userId is invalid
    if (!userId || userId <= 0) {
      setData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const clocks = await getUserClocks(userId, authToken)
      setData(clocks)
    } catch (err) {
      console.error('Failed to fetch user clocks:', err)
      setIsError(true)
      setError(err)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, authToken])

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
