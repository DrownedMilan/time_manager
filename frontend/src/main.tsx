import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(<App />)
=======
import { lazy, Suspense } from 'react'
import { KcPage, type KcContext } from './keycloak-theme/kc.gen'

const AppEntrypoint = lazy(() => import('./main.app'))

createRoot(document.getElementById('root')!).render(
  <>
    {window.kcContext ? (
      <KcPage kcContext={window.kcContext} />
    ) : (
      <Suspense>
        <AppEntrypoint />
      </Suspense>
    )}
  </>,
)

declare global {
  interface Window {
    kcContext?: KcContext
  }
}
>>>>>>> 232ba8f (add:config-keycloakify-working)
