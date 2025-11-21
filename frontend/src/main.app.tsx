import App from './App'
import { KeycloakProvider } from '@/features/auth/keycloakProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

const queryClient = new QueryClient()

export default function AppEntrypoint() {
  return (
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </KeycloakProvider>
  )
}
