
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function Profile() {
  // Mock user data - in a real app, this would come from a backend
  const userData = {
    name: "John Doe",
    phone: "+91 9876543210",
    investments: [
      {
        project: "Aura",
        model: "Gold Investment Model",
        slots: 2,
        invested: "₹2,00,000",
        expectedReturns: "₹2,48,000"
      },
      {
        project: "Subha White Waters",
        model: "Platinum Investment Model",
        slots: 1,
        invested: "₹1,00,000",
        expectedReturns: "₹1,28,000"
      }
    ]
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Profile Details</Typography>
        <Typography variant="body1">Name: {userData.name}</Typography>
        <Typography variant="body1">Phone: {userData.phone}</Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>My Investments</Typography>
        <List>
          {userData.investments.map((investment, index) => (
            <Box key={index}>
              <ListItem>
                <ListItemText
                  primary={investment.project}
                  secondary={
                    <>
                      <Typography variant="body2">Model: {investment.model}</Typography>
                      <Typography variant="body2">Slots: {investment.slots}</Typography>
                      <Typography variant="body2">Invested: {investment.invested}</Typography>
                      <Typography variant="body2">Expected Returns: {investment.expectedReturns}</Typography>
                    </>
                  }
                />
              </ListItem>
              {index < userData.investments.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
