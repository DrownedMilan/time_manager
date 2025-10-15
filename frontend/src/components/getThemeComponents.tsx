import { Components, Theme } from '@mui/material/styles'

export const getThemeComponents = (mode: 'light' | 'dark'): Components<Theme> => ({
	MuiButton: {
		styleOverrides: {
			root: {
				textTransform: 'none',
				fontWeight: 500,
				borderRadius: 8,
				padding: '10px 20px',
				fontSize: '0.95rem',
				boxShadow: 'none',
				'&:hover': {
					boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
					transform: 'translateY(-1px)',
				},
				transition: 'all 0.2s ease-in-out',
			},
			contained: {
				'&:hover': {
					boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
				},
			},
		},
	},
	MuiCard: {
		styleOverrides: {
			root: {
				borderRadius: 12,
				boxShadow: mode === 'light'
					? '0 2px 8px rgba(0,0,0,0.1)'
					: '0 2px 8px rgba(0,0,0,0.3)',
				'&:hover': {
					boxShadow: mode === 'light'
						? '0 4px 16px rgba(0,0,0,0.15)'
						: '0 4px 16px rgba(0,0,0,0.4)',
					transform: 'translateY(-2px)',
				},
				transition: 'all 0.3s ease-in-out',
			},
		},
	},
	MuiTextField: {
		styleOverrides: {
			root: {
				'& .MuiOutlinedInput-root': {
					borderRadius: 8,
				},
			},
		},
	},
	MuiAppBar: {
		styleOverrides: {
			root: {
				boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
			},
		},
	},
})