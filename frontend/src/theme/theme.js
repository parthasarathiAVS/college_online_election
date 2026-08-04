import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6'
    },
    secondary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8'
    },
    background: {
      default: '#0B0F1A',
      paper: 'rgba(17, 24, 45, 0.85)'
    },
    success: {
      main: '#10B981',
      light: '#34D399'
    },
    error: {
      main: '#EF4444',
      light: '#F87171'
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24'
    },
    info: {
      main: '#3B82F6'
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8'
    },
    divider: 'rgba(148, 163, 184, 0.12)'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, color: '#94A3B8' },
    body1: { fontWeight: 400 },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(17, 24, 45, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(124, 58, 237, 0.5)'
            }
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          color: '#A78BFA'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(11, 15, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(148, 163, 184, 0.08)'
        }
      }
    }
  }
});

export default theme;
