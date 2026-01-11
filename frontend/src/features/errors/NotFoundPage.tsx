import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { authenticated, keycloak } = useAuth()

  const handleGoHome = () => {
    if (authenticated && keycloak?.tokenParsed) {
      const roles =
        keycloak.tokenParsed.realm_access?.roles?.map((r: string) => r.toLowerCase()) || []
      if (roles.includes('organization')) {
        navigate('/organization')
      } else if (roles.includes('manager')) {
        navigate('/manager')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/login')
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
            <FileQuestion className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-white/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
