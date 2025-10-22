<<<<<<< HEAD
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
=======
import { useContext } from 'react'
import { AuthContext } from '../auth/keycloakProvider'

export default function LoginPage() {
  const { keycloak, authenticated } = useContext(AuthContext)

  const handleLogin = () => {
    keycloak.login({ redirectUri: window.location.origin })
  }

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion Time Manager</h1>
        {authenticated ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all"
          >
            Se déconnecter
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all"
          >
            Se connecter
          </button>
        )}
      </div>
    </div>
>>>>>>> 232ba8f (add:config-keycloakify-working)
  )
}
