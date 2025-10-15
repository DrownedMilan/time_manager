import { useState, useCallback, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { useUser } from '@/hooks/useUserClock'
import { UserProfileCard } from '@/components/UserProfile/UserProfileCard'
import { TimeRecordsTable } from '@/components/TimeRecords/TimeRecordsTable'
import { LoadingCard } from '@/components/common/LoadingCard'

export default function UsersPage() {
  const USER_ID = 1
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { user, clocks, loading, processing, isClockedIn, handleClockToggle } = useUser(USER_ID)

  const getTodayWorkingHours = useCallback((): string => {
    const today = new Date()
    const todayClocks = clocks.filter((clock) => clock.clock_in === today)

    let totalMinutes = 0
    todayClocks.forEach((clock) => {
      if (clock.clock_out) {
        totalMinutes += (clock.clock_out.getTime() - clock.clock_in.getTime()) / (1000 * 60)
      }
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)
    return `${hours}h ${minutes}m`
  }, [clocks])

  const handleSort = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }, [])

  const todayHours = useMemo(() => getTodayWorkingHours(), [getTodayWorkingHours])

  if (loading) {
    return <LoadingCard />
  }

  if (!user) {
    return <LoadingCard message="Employee Not Found" />
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 1,
            fontSize: { xs: '1rem', md: '1.5rem' },
          }}
        >
          Employee Time Management
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'rgba(162, 162, 162, 0.6)',
            fontSize: '1.1rem',
            fontWeight: 400,
            letterSpacing: '0.5px',
          }}
        >
          Professional Time Tracking System
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 4,
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <UserProfileCard
          user={user}
          isClockedIn={isClockedIn}
          processing={processing}
          todayHours={todayHours}
          onClockToggle={handleClockToggle}
        />

        <Box sx={{ flex: 1 }}>
          <TimeRecordsTable clocks={clocks} sortOrder={sortOrder} onSort={handleSort} />
        </Box>
      </Box>
    </Box>
  )
}
