
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Real Estate Investment
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/invest')}
        sx={{ mt: 4 }}
      >
        Start New Investment
      </Button>
    </Box>
  );
}
