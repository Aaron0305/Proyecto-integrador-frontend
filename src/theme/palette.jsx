import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#041c6c',      // Nuevo color principal
      light: '#1a3384',     // Versión más clara
      dark: '#02103f',      // Versión más oscura
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#041c6c',      
      light: '#1a3384',     
      contrastText: '#ffffff',
    },
    background: {
      default: '#e6f0ff',   
      paper: '#ffffff',     
    },
  },
  transitions: {
    easing: {
      sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: '#14628b', // color3
    },
    h2: {
      color: '#14628b', // color3
    },
    h3: {
      color: '#122a42', // color2
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#20a3d8', // color4
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#5ffffb', // versión más clara de color5
          },
        },
      },
    },
  },
});