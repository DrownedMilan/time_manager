import { Building2, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'

interface LoadingPageProps {
  onForceLogout?: () => void
}

export const LoadingPage = ({ onForceLogout }: LoadingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/10 rounded-full border border-white/20">
            <Building2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Time Manager</h1>
        <p className="text-white/70 mb-6">Initialisation de la session...</p>

        <Loader2 className="w-8 h-8 mx-auto animate-spin text-white mb-6" />

        <Button
          variant="outline"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
          onClick={onForceLogout}
        >
          🔄 Forcer le logout
        </Button>
      </div>
    </div>
  )
}
