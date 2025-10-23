import App from './App'
import { KeycloakProvider } from './auth/keycloakProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

const queryClient = new QueryClient()

export default function AppEntrypoint() {
  return (
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </KeycloakProvider>
  )
}
