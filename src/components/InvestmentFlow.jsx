import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  TextField,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const projects = [
  {
    name: 'Aura',
    location: 'Bangalore',
    minInvestment: '₹1 Lakh',
    returns: '14% p.a.',
    lockIn: '3 years',
  },
  {
    name: 'Subha White Waters',
    location: 'Bangalore',
    minInvestment: '₹1.5 Lakh',
    returns: '16% p.a.',
    lockIn: '4 years',
  },
];

const investmentModels = [
  {
    name: 'Gold Investment Model',
    minInvestment: '₹1L',
    roi: '12%',
    lockIn: '3 years',
    slots: 5,
  },
  {
    name: 'Platinum Investment Model',
    minInvestment: '₹1L',
    roi: '14%',
    lockIn: '4 years',
    slots: 3,
  },
  {
    name: 'Virtual Investment Model',
    minInvestment: '₹1L',
    roi: '10%',
    lockIn: '2 years',
    slots: 10,
  },
];

export default function InvestmentFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [slots, setSlots] = useState(1);
  const [quantity, setQuantity] = useState(1); // Added state for quantity per slot
  const [showSummary, setShowSummary] = useState(false);

  const steps = ['Select Project', 'Choose Model', 'Slots & Payment'];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', px: { xs: 2, sm: 3 }, mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>+ New Investment</Typography> {/* Added page heading */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Accordion
        expanded={activeStep === 0}
        onChange={() => setActiveStep(0)}
        sx={{ bgcolor: '#EEEEEE' }} // Added background color to Accordion
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <ApartmentIcon sx={{ mr: 2 }} />
          <Typography>Project Selection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} key={project.name}>
                <Card
                  variant={selectedProject?.name === project.name ? 'elevation' : 'outlined'}
                  onClick={() => {
                    setSelectedProject(project);
                    handleNext();
                  }}
                  sx={{
                    cursor: 'pointer',
                    transition: '0.3s',
                    border: selectedProject?.name === project.name ? '2px solid #005c90' : '1px solid rgba(0,0,0,0.12)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      borderColor: '#005c90',
                    },
                  }}
                >
                  {selectedProject?.name === project.name && (
                    <CheckCircleIcon
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: '#005c90',
                        bgcolor: 'white',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography color="text.secondary">{project.location}</Typography>
                    <Typography>Min Investment: {project.minInvestment}</Typography>
                    <Typography>Returns: {project.returns}</Typography>
                    <Typography>Lock-in: {project.lockIn}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={activeStep === 1}
        onChange={() => selectedProject && setActiveStep(1)}
        sx={{ bgcolor: '#EEEEEE' }} // Added background color to Accordion
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AccountBalanceIcon sx={{ mr: 2 }} />
          <Typography>Investment Model</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {investmentModels.map((model) => (
              <Grid item xs={12} md={4} key={model.name}>
                <Card
                  variant={selectedModel?.name === model.name ? 'elevation' : 'outlined'}
                  onClick={() => {
                    setSelectedModel(model);
                    handleNext();
                  }}
                  sx={{
                    cursor: 'pointer',
                    transition: '0.3s',
                    border: selectedModel?.name === model.name ? '2px solid #005c90' : '1px solid rgba(0,0,0,0.12)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      borderColor: '#005c90',
                    },
                  }}
                >
                  {selectedModel?.name === model.name && (
                    <CheckCircleIcon
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: '#005c90',
                        bgcolor: 'white',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{model.name}</Typography>
                    <Typography>Min Investment: {model.minInvestment}</Typography>
                    <Typography>ROI: {model.roi}</Typography>
                    <Typography>Lock-in: {model.lockIn}</Typography>
                    <Typography>Available Slots: {model.slots}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={activeStep === 2}
        onChange={() => selectedModel && setActiveStep(2)}
        sx={{ bgcolor: '#EEEEEE' }} // Added background color to Accordion

      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <PaymentIcon sx={{ mr: 2 }} />
          <Typography>Select Lot/Share</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Slots"
                  value={slots}
                  onChange={(e) => setSlots(parseInt(e.target.value, 10) || 0)} //added parseInt and default 0
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity per Slot"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)} //added parseInt and default 0
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 3 }}>
              Total Investment: ₹{slots * quantity * 100000}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => setShowSummary(true)}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #005c90 30%, #0288d1 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #004b75 30%, #0277bd 90%)',
                },
              }}
            >
              Proceed To Payment
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {showSummary && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#005c90' }}>
            Investment Summary
          </Typography>

          {selectedProject && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{selectedProject.name}</Typography>
                <Typography color="text.secondary">{selectedProject.location}</Typography>
                <Typography>Returns: {selectedProject.returns}</Typography>
                <Typography>Lock-in: {selectedProject.lockIn}</Typography>
              </CardContent>
            </Card>
          )}

          {selectedModel && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{selectedModel.name}</Typography>
                <Typography>ROI: {selectedModel.roi}</Typography>
                <Typography>Lock-in: {selectedModel.lockIn}</Typography>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Selected Slots/Shares</Typography>
              <Typography>Number of Slots: {slots}</Typography>
              <Typography>Quantity per Slot: {quantity}</Typography>
              <Typography variant="h6" sx={{ mt: 2, color: '#005c90' }}>
                Total Investment: ₹{slots * quantity * 100000}
              </Typography>
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #005c90 30%, #0288d1 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #004b75 30%, #0277bd 90%)',
              },
            }}
          >
            Pay Now
          </Button>
        </Box>
      )}
    </Box>
  );
}