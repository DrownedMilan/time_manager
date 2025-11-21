import { createTheme, type Theme } from '@mui/material/styles'
import { getThemeComponents } from './components'

export const getAppTheme = (): Theme =>
  createTheme({
    palette: {
      mode: 'light',
      background: {
        default:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.95) 100%)',
        paper: 'rgba(255, 255, 255, 0.88)',
      },
      primary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#1D4ED8',
        contrastText: '#0F172A',
      },
      secondary: {
        main: '#38BDF8',
        light: '#7DD3FC',
        dark: '#0EA5E9',
        contrastText: '#0F172A',
      },
      text: {
        primary: 'rgba(15, 23, 42, 0.92)',
        secondary: 'rgba(15, 23, 42, 0.65)',
      },
      divider: 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '3rem',
        lineHeight: 1.15,
        letterSpacing: '-0.015em',
        color: '#1E3A8A',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2.25rem',
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
        color: '#1E3A8A',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.35,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.65,
        letterSpacing: '0.01em',
      },
      body2: {
        fontSize: '0.9rem',
        lineHeight: 1.55,
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        letterSpacing: '0.04em',
        fontWeight: 500,
        textTransform: 'uppercase',
        color: 'rgba(15, 23, 42, 0.5)',
      },
    },
    shape: { borderRadius: 14 },
    spacing: 8,
    shadows: [
      'none',
      '0 1px 4px rgba(15, 23, 42, 0.08)',
      '0 2px 8px rgba(15, 23, 42, 0.08)',
      '0 3px 12px rgba(15, 23, 42, 0.1)',
      '0 4px 16px rgba(15, 23, 42, 0.1)',
      '0 6px 18px rgba(15, 23, 42, 0.12)',
      '0 8px 22px rgba(15, 23, 42, 0.12)',
      '0 10px 26px rgba(15, 23, 42, 0.14)',
      '0 12px 30px rgba(15, 23, 42, 0.14)',
      '0 14px 34px rgba(15, 23, 42, 0.16)',
      '0 16px 38px rgba(15, 23, 42, 0.16)',
      '0 18px 42px rgba(15, 23, 42, 0.18)',
      '0 20px 46px rgba(15, 23, 42, 0.18)',
      '0 22px 50px rgba(15, 23, 42, 0.2)',
      '0 24px 54px rgba(15, 23, 42, 0.2)',
      '0 26px 58px rgba(15, 23, 42, 0.22)',
      '0 28px 62px rgba(15, 23, 42, 0.22)',
      '0 30px 66px rgba(15, 23, 42, 0.24)',
      '0 32px 70px rgba(15, 23, 42, 0.24)',
      '0 34px 74px rgba(15, 23, 42, 0.26)',
      '0 36px 78px rgba(15, 23, 42, 0.26)',
      '0 38px 82px rgba(15, 23, 42, 0.28)',
      '0 40px 86px rgba(15, 23, 42, 0.28)',
      '0 42px 90px rgba(15, 23, 42, 0.3)',
      '0 44px 94px rgba(15, 23, 42, 0.3)',
    ],
    components: getThemeComponents(),
  })
