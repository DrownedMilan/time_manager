import { AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

interface HeaderProps {
  toggleTheme: () => void
  mode: 'light' | 'dark'
}

export default function Header({ toggleTheme, mode }: HeaderProps) {
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Time Manager
        </Typography>

        <Button
          color="inherit"
          onClick={toggleTheme}
          sx={{
            textTransform: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </Toolbar>
    </AppBar>
  )
}
