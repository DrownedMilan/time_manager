import { memo } from 'react'
import {
  Card,
  Avatar,
  Typography,
  Button,
  Chip,
  Divider,
  Stack,
  Box,
  CircularProgress,
} from '@mui/material'
import { AccessTime, Schedule, BusinessCenter, Person, TrendingUp } from '@mui/icons-material'
import type { User } from '@/types/user'

interface UserProfileCardProps {
  user: User
  isClockedIn: boolean
  processing: boolean
  todayHours: string
  onClockToggle: () => void
}

export const UserProfileCard = memo(
  ({ user, isClockedIn, processing, todayHours, onClockToggle }: UserProfileCardProps) => {
    return (
      <Card
        elevation={0}
        sx={{
          width: 420,
          height: 'fit-content',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'sticky',
          top: '2rem',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 16px 48px rgba(99, 102, 241, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {/* Status Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: isClockedIn
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : 'linear-gradient(135deg, #F59E0B, #D97706)',
            boxShadow: isClockedIn
              ? '0 0 20px rgba(16, 185, 129, 0.6)'
              : '0 0 20px rgba(245, 158, 11, 0.6)',
            animation: isClockedIn ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.2)', opacity: 0.7 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        />

        {/* Avatar Section */}
        <Box
          sx={{
            position: 'relative',
            mb: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -15,
              left: -15,
              right: -15,
              bottom: -15,
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.3))',
              borderRadius: '50%',
              filter: 'blur(20px)',
              zIndex: -1,
            },
          }}
        >
          <Box
            sx={{
              background:
                'linear-gradient(145deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
              borderRadius: '50%',
              p: 3,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: 'white',
                width: 120,
                height: 120,
                fontSize: '3rem',
                fontWeight: 700,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user.first_name ? user.first_name[0].toUpperCase() : <Person />}
            </Avatar>
          </Box>
        </Box>

        {/* User Info */}
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1,
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          {user.first_name} {user.last_name}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'rgba(0, 0, 0, 0.8)',
            mb: 1,
            fontWeight: 400,
            textAlign: 'center',
          }}
        >
          {user.email}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(0, 0, 0, 0.6)',
            mb: 4,
            textAlign: 'center',
          }}
        >
          {user.phone_number}
        </Typography>

        {/* Divider */}
        <Divider
          sx={{
            width: '100%',
            mb: 2,
            background:
              'linear-gradient(90deg, transparent, rgba(102, 43, 110, 0.33), transparent)',
            height: '1px',
            border: 'none',
          }}
        />

        {/* Today's Stats */}
        <Stack direction="row" spacing={3} sx={{ mb: 2, width: '100%' }}>
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <TrendingUp sx={{ color: '#06B6D4', mb: 1 }} />
            <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
              Today's Hours
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 1)', fontWeight: 700 }}>
              {todayHours}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <BusinessCenter sx={{ color: isClockedIn ? '#10B981' : '#F59E0B', mb: 1 }} />
            <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
              Status
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: isClockedIn ? '#10B981' : '#F59E0B',
                fontWeight: 700,
              }}
            >
              {isClockedIn ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Stack>

        {/* Clock Button */}
        <Button
          variant="contained"
          size="large"
          disabled={processing}
          onClick={onClockToggle}
          startIcon={<AccessTime />}
          sx={{
            background: isClockedIn
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none',
            borderRadius: '20px',
            px: 6,
            py: 2.5,
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            textTransform: 'none',
            boxShadow: isClockedIn
              ? '0 8px 32px rgba(239, 68, 68, 0.4)'
              : '0 8px 32px rgba(16, 185, 129, 0.4)',
            mb: 3,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.6s ease',
            },
            '&:hover': {
              background: isClockedIn
                ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
                : 'linear-gradient(135deg, #059669, #047857)',
              transform: 'translateY(-2px)',
              boxShadow: isClockedIn
                ? '0 12px 40px rgba(239, 68, 68, 0.5)'
                : '0 12px 40px rgba(16, 185, 129, 0.5)',
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
              boxShadow: 'none',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {processing && (
            <CircularProgress
              size={20}
              sx={{
                color: 'white',
                mr: 1,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
          )}
          {processing ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
        </Button>

        {/* Status Chip */}
        <Chip
          label={isClockedIn ? 'Currently Working' : 'Off Duty'}
          icon={isClockedIn ? <BusinessCenter /> : <Schedule />}
          sx={{
            background: isClockedIn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isClockedIn ? '#10B981' : '#F59E0B',
            border: `1px solid ${
              isClockedIn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
            }`,
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            fontSize: '0.9rem',
            px: 2,
            py: 1,
            height: 'auto',
            borderRadius: '12px',
            '& .MuiChip-icon': {
              fontSize: '1rem',
            },
          }}
        />
      </Card>
    )
  },
)

UserProfileCard.displayName = 'UserProfileCard'
