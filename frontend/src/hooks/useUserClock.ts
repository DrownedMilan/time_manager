import { useState, useEffect, useCallback } from 'react'
import type { User } from '../types/user'
import type { Clock } from '@/types/clock'
import { api } from '@/services/api'
import { getUserClocks, createClockInOut } from '../services/clockService'

export const useUser = (userId: number) => {
  const [user, setUser] = useState<User | null>(null)
  const [clocks, setClocks] = useState<Clock[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)

  const fetchUserData = useCallback(async () => {
    try {
      const [userRes, userClocks] = await Promise.all([
        api.get(`/users/${userId}`),
        getUserClocks(userId),
      ])

      setUser(userRes.data)
      setClocks(userClocks)
      setIsClockedIn(userClocks.some((c: Clock) => c.clock_out === null))
    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const handleClockToggle = useCallback(async () => {
    setProcessing(true)
    try {
      const res = await createClockInOut(userId)
      const updatedClocks = await getUserClocks(userId)
      setClocks(updatedClocks)
      setIsClockedIn(res.clock_out === null)
    } catch (err) {
      console.error('Clock toggle error:', err)
    } finally {
      setProcessing(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  return {
    user,
    clocks,
    loading,
    processing,
    isClockedIn,
    handleClockToggle,
  }
}
