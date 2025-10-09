import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface AppLayoutProps {
  toggleTheme: () => void
  mode: 'light' | 'dark'
}

export default function AppLayout({ toggleTheme, mode }: AppLayoutProps) {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header toggleTheme={toggleTheme} mode={mode} />
      <Container sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  )
}
