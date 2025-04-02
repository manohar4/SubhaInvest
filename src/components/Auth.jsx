
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Stack } from '@mui/material';

export default function Auth() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setShowOtp(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
    }}>
      {/* Left side - Image */}
      <Box sx={{ 
        flex: 1,
        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: { xs: 'none', md: 'block' }
      }} />

      {/* Right side - Login Form */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'white',
        p: 0
      }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 4,
            justifyContent: 'center'
          }}>
            <img 
              src="/subha.png" 
              alt="Subha Logo" 
              style={{ 
                height: '40px',
                objectFit: 'contain'
              }} 
            />
            <Typography variant="h4" sx={{ color: '#005c90', fontWeight: 600 }}>
              Invest
            </Typography>
          </Box>

          <Typography variant="h5" align="center" gutterBottom sx={{ color: '#005c90' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4, color: '#666' }}>
            Login to access your investment portfolio
          </Typography>

          <form onSubmit={showOtp ? handleLogin : handleSendOtp}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={showOtp}
              />

              {showOtp && (
                <TextField
                  fullWidth
                  label="Enter OTP"
                  variant="outlined"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputProps={{ maxLength: 6 }}
                />
              )}

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #005c90 30%, #0288d1 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #004b75 30%, #0277bd 90%)',
                  }
                }}
              >
                {showOtp ? 'Login' : 'Send OTP'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
