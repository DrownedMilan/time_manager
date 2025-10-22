import App from './App'
import { KeycloakProvider } from './auth/keycloakProvider'
import './index.css'

export default function AppEntrypoint() {
  return (
    <KeycloakProvider>
      <App />
    </KeycloakProvider>
  )
}
