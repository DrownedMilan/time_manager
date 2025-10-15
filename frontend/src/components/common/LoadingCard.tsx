import { Box, Typography, Card, CircularProgress } from '@mui/material'
import { CloudSync } from '@mui/icons-material'

interface LoadingCardProps {
  message?: string
}

export const LoadingCard = ({ message = 'Loading Employee Data...' }: LoadingCardProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #2D3748 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          minWidth: 350,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #6366F1, #06B6D4, #6366F1)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear',
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        }}
      >
        {/* Loading Icon */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              filter: 'blur(20px)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.1)', opacity: 0.3 },
                '100%': { transform: 'scale(1)', opacity: 0.7 },
              },
            }}
          />
          <CircularProgress
            size={80}
            thickness={3}
            sx={{
              color: '#6366F1',
              position: 'relative',
              zIndex: 1,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                strokeDasharray: '80px, 200px',
                strokeDashoffset: 0,
                animation: 'dash 1.4s ease-in-out infinite',
              },
              '@keyframes dash': {
                '0%': {
                  strokeDasharray: '1px, 200px',
                  strokeDashoffset: 0,
                },
                '50%': {
                  strokeDasharray: '100px, 200px',
                  strokeDashoffset: -15,
                },
                '100%': {
                  strokeDasharray: '100px, 200px',
                  strokeDashoffset: -125,
                },
              },
            }}
          />
          <CloudSync
            sx={{
              position: 'absolute',
              fontSize: '2rem',
              color: '#06B6D4',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          />
        </Box>

        {/* Loading Text */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            {message}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.95rem',
              fontWeight: 400,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Please wait while we process your request
          </Typography>
        </Box>

        {/* Loading Dots */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`,
                '@keyframes bounce': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0)',
                  },
                  '40%': {
                    transform: 'scale(1)',
                  },
                },
              }}
            />
          ))}
        </Box>
      </Card>
    </Box>
  )
}
