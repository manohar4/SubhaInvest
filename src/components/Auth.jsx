import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

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
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #005c90 30%, #0288d1 90%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 400,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <img 
            src="/subha.png" 
            alt="Subha Logo" 
            style={{ 
              width: '200px',
              height: 'auto',
              marginBottom: '20px',
              objectFit: 'contain'
            }} 
          />
          <Typography variant="h4" sx={{ color: '#005c90', fontWeight: 600, letterSpacing: '1px' }}>
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
          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
            disabled={showOtp}
          />

          {showOtp && (
            <TextField
              fullWidth
              label="Enter OTP"
              variant="outlined"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 6 }}
            />
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              mt: 2,
              py: 1.5,
              background: 'linear-gradient(45deg, #005c90 30%, #0288d1 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #004b75 30%, #0277bd 90%)',
              }
            }}
          >
            {showOtp ? 'Login' : 'Send OTP'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}