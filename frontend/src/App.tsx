import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes'

interface AppProps {
  toggleTheme: () => void
  mode: 'light' | 'dark'
}

export default function App({ toggleTheme, mode }: AppProps) {
  return (
    <BrowserRouter>
      <AppRoutes toggleTheme={toggleTheme} mode={mode} />
    </BrowserRouter>
  )
}
