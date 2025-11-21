import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import { Button } from '../../components/ui/button'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const { keycloak, authenticated, logout } = useContext(AuthContext)

  const handleLogin = () => {
    keycloak.login({ redirectUri: window.location.origin })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white/10 rounded-full border border-white/20">
            <Building2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Bank Clock</h1>
        <p className="text-white/70 mb-8">Employee Time Management System</p>

        {authenticated ? (
          <Button
            onClick={() => logout()}
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white transition-all"
          >
            Se déconnecter
          </Button>
        ) : (
          <Button
            onClick={handleLogin}
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white transition-all"
          >
            Se connecter
          </Button>
        )}
      </div>
    </div>
  )
}
