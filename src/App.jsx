
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import InvestmentFlow from './components/InvestmentFlow';
import Profile from './components/Profile';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Navy blue shade
    },
    secondary: {
      main: '#0d47a1',
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<InvestmentFlow />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
