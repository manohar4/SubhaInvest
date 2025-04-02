
import { AppBar, Box, Toolbar, Typography, IconButton, Avatar } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: '#005c90', px: 0 }}>
        <Toolbar sx={{ px: 0 }}>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
            <HomeIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/subha.png" alt="Subha Logo" style={{ height: '40px', marginRight: '10px', filter: 'brightness(0) invert(1)' }} />
            <Typography variant="h6" component="div">
              Invest
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={() => navigate('/profile')}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
