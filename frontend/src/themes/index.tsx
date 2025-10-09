// src/themes/index.tsx
import { createTheme, type Theme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

export const getAppTheme = (mode: PaletteMode): Theme =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            primary: { main: '#1976d2' },
          }
        : {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            primary: { main: '#90caf9' },
          }),
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
    },
  })
