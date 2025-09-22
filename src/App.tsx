import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
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
      <Box sx={{
        width: '100vw',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <Surgeries />
        <Toaster position="top-right" />
      </Box>
    </ThemeProvider>
  );
}

export default App;