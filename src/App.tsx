import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
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
      <div className="App">
        <Surgeries />
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
