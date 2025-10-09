import { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import App from './App'
import { getAppTheme } from './themes'

export default function Main() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const theme = useMemo(() => getAppTheme(mode), [mode])

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main />)
