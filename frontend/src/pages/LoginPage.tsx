import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { keycloak, authenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    keycloak.login({ redirectUri: window.location.origin })
  }

  useEffect(() => {
    if (authenticated) {
      navigate('/dashboard')
    }
  }, [authenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion Time Manager</h1>

        {authenticated ? (
          <button
            onClick={logout}
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
