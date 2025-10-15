import { memo, useMemo } from 'react'
import {
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box,
} from '@mui/material'
import { Timeline, Schedule, AccessTime } from '@mui/icons-material'
import type { Clock } from '@/types/clock'

interface TimeRecordsTableProps {
  clocks: Clock[]
  sortOrder: 'asc' | 'desc'
  onSort: () => void
}

const formatDuration = (clockIn: Date, clockOut: Date | null) => {
  if (!clockOut) return '-'

  const diffMs = clockOut.getTime() - clockIn.getTime()

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

export const TimeRecordsTable = memo(({ clocks, sortOrder, onSort }: TimeRecordsTableProps) => {
  const sortedClocks = useMemo(() => {
    return [...clocks].sort((a, b) => {
      const dateA = a.clock_in.getTime()
      const dateB = b.clock_in.getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [clocks, sortOrder])

  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #6366F1, #06B6D4, #6366F1)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite linear',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 16px 48px rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: 5, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Timeline
            sx={{
              fontSize: '2rem',
              mr: 2,
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Time Records
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: '#22b8d395',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: 400,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          Complete History of Clock Activities
        </Typography>
      </Box>

      {/* Table Container */}
      <TableContainer
        component={Box}
        sx={{
          maxHeight: '70vh',
          overflow: 'auto',
          borderRadius: '0 0 24px 24px',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            borderRadius: '8px',
            '&:hover': {
              background: 'linear-gradient(135deg, #5B5BD6, #0891B2)',
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: 'transparent',
          },
        }}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: 650,
            tableLayout: 'fixed',
            width: '100%',
            '& .MuiTableCell-stickyHeader': {
              top: 0,
              zIndex: 3,
            },
          }}
        >
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '25%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: '15%',
                  minWidth: '120px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  border: 'none',
                  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                  position: 'relative',
                  py: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#06B6D4',
                  }}
                >
                  Record ID
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  width: '30%',
                  minWidth: '180px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  border: 'none',
                  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                  position: 'relative',
                  py: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent)',
                  },
                }}
              >
                <TableSortLabel
                  active={true}
                  direction={sortOrder}
                  onClick={onSort}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95) !important',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '& .MuiTableSortLabel-icon': {
                      color: 'rgba(255, 255, 255, 0.95) !important',
                    },
                    '&:hover': {
                      color: '#06B6D4 !important',
                    },
                    '&.Mui-active': {
                      color: '#06B6D4 !important',
                    },
                  }}
                >
                  <AccessTime sx={{ fontSize: '1rem' }} />
                  Clock In
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  width: '30%',
                  minWidth: '180px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                  color: '#06B6D4',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  border: 'none',
                  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                  position: 'relative',
                  py: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: '1rem' }} />
                  Clock Out
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  width: '25%',
                  minWidth: '150px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                  color: '#06B6D4',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  border: 'none',
                  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                  position: 'relative',
                  py: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent)',
                  },
                }}
              >
                Duration
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedClocks.map((clock) => (
              <TableRow
                key={clock.id}
                sx={{
                  // 2) Avoid scaling the row; keep only color change
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.1)',
                    // remove: transform: 'scale(1.002)',
                  },
                  position: 'relative',
                  '&::before': {
                    /* your left accent bar, fine as absolute */
                  },
                }}
              >
                {/* 3) Prevent content from stretching cells */}
                <TableCell
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <Chip
                    label={`#${clock.id.toString().padStart(4, '0')}`}
                    size="small"
                    sx={{ maxWidth: '100%' }}
                  />
                </TableCell>

                <TableCell
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {formatDateTime(clock.clock_in)}
                </TableCell>

                <TableCell
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {clock.clock_out ? formatDateTime(clock.clock_out) : <Chip /* … */ />}
                </TableCell>

                <TableCell
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {clock.clock_out ? (
                    <Chip label={formatDuration(clock.clock_in, clock.clock_out)} size="small" />
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
})

TimeRecordsTable.displayName = 'TimeRecordsTable'
