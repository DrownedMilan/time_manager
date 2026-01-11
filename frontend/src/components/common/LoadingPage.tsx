import { Building2, Loader2 } from 'lucide-react'

interface LoadingPageProps {
  onForceLogout?: () => void
}

export const LoadingPage = ({ onForceLogout }: LoadingPageProps) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #020617, #172554, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '5rem',
            width: '18rem',
            height: '18rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5rem',
            right: '5rem',
            width: '24rem',
            height: '24rem',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Building2 style={{ width: '3rem', height: '3rem', color: 'white' }} />
          </div>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Time Manager
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem' }}>Loading...</p>

        <Loader2
          style={{
            width: '2rem',
            height: '2rem',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite',
            color: 'white',
          }}
        />

        {onForceLogout && (
          <button
            onClick={onForceLogout}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            🔄 Force Logout
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
