import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
// import Header from '../../components/Header'
// import Footer from '../../components/Footer'

export default function AppLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(236, 244, 255, 0.92) 100%)',
        position: 'relative',
        isolation: 'isolate',
      }}
    >
      {/* <Header /> */}
      
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Outlet />
        </Box>
      </Container>
      
      {/* <Footer /> */}
    </Box>
  )
}
