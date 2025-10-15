import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AccessTime } from '@mui/icons-material'

export default function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
        {/* Logo Section */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3B82F6, #38BDF8)',
              boxShadow: '0 6px 14px rgba(59, 130, 246, 0.2)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 2,
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
              },
            }}
          >
            <AccessTime
              sx={{
                fontSize: '1.5rem',
                color: '#0F172A',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: '#1D4ED8',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: '1.5rem',
            }}
          >
            Time Manager
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          sx={{
            borderRadius: '999px',
            px: 3,
            py: 1,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  )
}
