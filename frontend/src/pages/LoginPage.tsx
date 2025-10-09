import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Avatar } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  alert(`Email: ${email}\nPassword: ${password}`)
}


  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #72877bff 0%, #21cbf3 100%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          width: 350,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#c3ccccff',
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5" component="h1" gutterBottom>
          Connexion
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Typography
            variant="h6"
            color="primary"
            sx={{ mt: 2, cursor: 'pointer' }}
            onClick={() => alert('Redirect to password reset')}
          >
            Forget password
          </Typography>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
