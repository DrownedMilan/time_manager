import { Box, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: 'center',
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Time Manager
      </Typography>
    </Box>
  )
}
