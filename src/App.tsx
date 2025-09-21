import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Surgeries from './components/Surgeries';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Surgeries />
      </div>
    </ThemeProvider>
  );
}

export default App;
