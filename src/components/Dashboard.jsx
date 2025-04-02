
import { Box, Button, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BiBuildingHouse } from 'react-icons/bi';

const projects = [
  {
    name: 'Aura',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
    description: 'Luxury apartments with modern amenities',
  },
  {
    name: 'Subha White Waters',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
    description: 'Premium waterfront residences',
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        <BiBuildingHouse style={{ verticalAlign: 'middle', marginRight: '10px' }} />
        Premium Real Estate Investment Opportunities
      </Typography>
      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project.name}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
              onClick={() => navigate('/invest')}
            >
              <CardMedia
                component="img"
                height="200"
                image={project.image}
                alt={project.name}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom>{project.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{project.location}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{project.description}</Typography>
                <Button variant="contained" fullWidth>Start Investing</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
