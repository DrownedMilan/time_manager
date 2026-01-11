import type { Components, Theme } from '@mui/material/styles'

type BaseTheme = Omit<Theme, 'components'>

export const getThemeComponents = (): Components<BaseTheme> => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.95) 100%)',
        backgroundAttachment: 'fixed',
        color: 'rgba(15, 23, 42, 0.92)',
        minHeight: '100vh',
        margin: 0,
      },
      '#root': {
        minHeight: '100vh',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: 12,
        padding: '8px 18px',
        fontSize: '0.95rem',
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(59, 130, 246, 0.18)',
        color: '#1D4ED8',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        background: 'linear-gradient(135deg, #3B82F6 0%, #38BDF8 100%)',
        color: '#0F172A',
        border: '1px solid rgba(59, 130, 246, 0.24)',
        boxShadow: '0 6px 18px rgba(59, 130, 246, 0.18)',
        '&:hover': {
          background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
          boxShadow: '0 10px 24px rgba(37, 99, 235, 0.2)',
        },
      },
      outlined: {
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        color: '#1D4ED8',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
        },
      },
      text: {
        color: '#1D4ED8',
        '&:hover': {
          background: 'rgba(59, 130, 246, 0.08)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(148, 163, 184, 0.16)',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: 18,
        border: '1px solid rgba(148, 163, 184, 0.14)',
        boxShadow: '0 10px 26px rgba(15, 23, 42, 0.1)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.12)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: 12,
          border: '1px solid rgba(148, 163, 184, 0.24)',
          transition: 'border 0.2s ease, box-shadow 0.2s ease',
          '& fieldset': {
            border: 'none',
          },
          '&:hover': {
            border: '1px solid rgba(59, 130, 246, 0.3)',
          },
          '&.Mui-focused': {
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.18)',
            background: 'rgba(255, 255, 255, 0.95)',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(15, 23, 42, 0.55)',
          '&.Mui-focused': {
            color: '#2563EB',
          },
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        color: '#0F172A',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        color: 'rgba(15, 23, 42, 0.75)',
        fontSize: '0.95rem',
      },
      head: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        fontWeight: 600,
        color: '#1D4ED8',
        borderBottom: '2px solid rgba(59, 130, 246, 0.25)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:nth-of-type(even)': {
          background: 'rgba(255, 255, 255, 0.85)',
        },
        '&:hover': {
          background: 'rgba(59, 130, 246, 0.08)',
        },
        transition: 'background 0.18s ease',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600,
        fontSize: '0.8rem',
        backdropFilter: 'blur(8px)',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.18)',
        color: '#1D4ED8',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        background: 'linear-gradient(135deg, #3B82F6 0%, #38BDF8 100%)',
        color: '#0F172A',
        border: '2px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 6px 18px rgba(59, 130, 246, 0.16)',
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        color: 'inherit',
      },
      h1: {
        color: '#1E3A8A',
      },
      h2: {
        color: '#1E40AF',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        background: 'rgba(255, 255, 255, 0.88)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        color: '#1F2937',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.28)',
        },
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'rgba(148, 163, 184, 0.2)',
        opacity: 1,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        background: 'rgba(59, 130, 246, 0.12)',
        borderRadius: 6,
        '& .MuiLinearProgress-bar': {
          background: 'linear-gradient(90deg, #3B82F6, #38BDF8)',
        },
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        },
      },
    },
  },
})
