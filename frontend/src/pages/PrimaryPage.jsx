import React, { useState, useEffect } from 'react';
import RecentIssues from '../components/RecentIssues';
import HeroSection from '../components/HeroSection';
import FAQ from '../components/FAQ';
import { 
  Card, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Container,
  useTheme,
  useMediaQuery 
} from '@mui/material';

// Import images - update paths according to your assets folder structure
import loginImage from '../assets/login-image.jpeg';
import describeImage from '../assets/describe-issue.png';
import submitImage from '../assets/submit-share.png';

function PrimaryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [analytics, setAnalytics] = useState({
    totalIssues: 6,
    resolvedIssues: 0,
    pendingIssues: 0
  });

  const reportingSteps = [
    "Log in to your Voice account",
    "Click on 'Upload Issue' in the navigation bar",
    "Fill in all required details including title, description, and location",
    "Upload supporting images (maximum 3)"
  ];

  const howItWorksSteps = [
    {
      title: "Log in to Your Account",
      description: "Use your email ID and password to log in. New users can sign up easily.",
      image: loginImage
    },
    {
      title: "Describe the Issue",
      description: "Click 'Upload Issue' and provide a clear title, description, and optional media like photos or videos.",
      image: describeImage
    },
    {
      title: "Submit and Share",
      description: "Submit the issue and share it to gather upvotes, boosting its priority on the leaderboard.",
      image: submitImage
    }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/issues/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        <Grid container spacing={3}>
          {/* Left Section */}
          <Grid item xs={12} md={7} lg={8}>
            {/* Hero Section */}
            <HeroSection />

            {/* Analytics Boxes */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { label: 'Total Issues', value: analytics.totalIssues },
                { label: 'Resolved', value: analytics.resolvedIssues },
                { label: 'Pending', value: analytics.pendingIssues }
              ].map((item, index) => (
                <Grid item xs={4} key={index}>
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#26313E',
                        fontSize: { xs: '1.75rem', sm: '2rem' },
                        mb: 1
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: '#4B5563',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* How it Works Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  color: '#26313E',
                  fontWeight: 600,
                  fontSize: '1.5rem'
                }}
              >
                How it Works
              </Typography>
              <Grid container spacing={3}>
                {howItWorksSteps.map((step, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <Box sx={{
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={step.image} 
                          alt={step.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                      <Box sx={{ p: 3, flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 1.5,
                            color: '#26313E',
                            fontWeight: 600
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#4B5563',
                            lineHeight: 1.6
                          }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Quick Guide Card */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              p: { xs: 2, sm: 3 }
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  color: '#26313E'
                }}
              >
                Quick Guide to Report an Issue
              </Typography>
              <Box component="ol" sx={{ 
                pl: 2,
                '& li': {
                  color: '#4B5563',
                  mb: 1.5,
                  pl: 0.5
                },
                '& li::marker': {
                  color: '#26313E',
                  fontWeight: 500
                }
              }}>
                {reportingSteps.map((step, index) => (
                  <Typography
                    component="li"
                    key={index}
                    sx={{ 
                      fontSize: '0.875rem',
                      lineHeight: 1.6
                    }}
                  >
                    {step}
                  </Typography>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Right Section */}
          <Grid item xs={12} md={5} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Recent Issues Component */}
              <RecentIssues />
              
              {/* FAQ Component */}
              <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
              }}>
                <FAQ />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default PrimaryPage;