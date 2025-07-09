import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NFCCard from './components/NFCCard';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#23272f',
    },
    secondary: {
      main: '#6b7280',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NFCCard />
    </ThemeProvider>
  );
}

export default App;
