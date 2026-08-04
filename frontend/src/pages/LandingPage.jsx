import React from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, Stack, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import LockIcon from '@mui/icons-material/Lock';
import AnalyticsIcon from '@mui/icons-material/Analytics';

export default function LandingPage() {
  return (
    <Box sx={{ overflow: 'hidden', pb: 10 }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 8, textAlign: 'center' }}>
        <Chip
          icon={<SecurityIcon sx={{ fontSize: 16, color: '#A78BFA !important' }} />}
          label="Next-Gen Institutional Kiosk EVM Platform"
          sx={{
            mb: 3,
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            color: '#A78BFA',
            borderColor: 'rgba(124, 58, 237, 0.3)',
            px: 1,
            py: 2
          }}
          variant="outlined"
        />

        <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 900, mb: 2 }}>
          VoteVerse <span style={{ color: '#7C3AED' }}>AI</span>
        </Typography>

        <Typography variant="h4" className="gradient-text" sx={{ mb: 3, fontWeight: 700 }}>
          Secure. Transparent. Smart Campus Democracy.
        </Typography>

        <Typography variant="h6" sx={{ color: '#94A3B8', maxWidth: 800, mx: 'auto', mb: 5, fontWeight: 400, lineHeight: 1.6 }}>
          Designed specifically for Colleges, Universities, and Educational Institutions. Students do NOT create accounts or log in online. Voting is conducted physically inside campus kiosks using authentic EVM hardware emulation.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              py: 1.8,
              px: 4,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)'
            }}
          >
            Register College Account
          </Button>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            size="large"
            sx={{
              py: 1.8,
              px: 4,
              fontSize: '1.1rem',
              borderColor: 'rgba(148, 163, 184, 0.3)',
              color: '#F1F5F9'
            }}
          >
            College Portal Login
          </Button>
        </Stack>
      </Container>

      {/* Feature Cards */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: 'rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TouchAppIcon sx={{ color: '#A78BFA', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#F1F5F9' }}>
                  Authentic EVM Experience
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                  Physical EVM layout with vertical candidate list, real EVM beep audio feedback, numpad shortcuts (1-9), and 20-second automatic reset timer.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <LockIcon sx={{ color: '#60A5FA', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#F1F5F9' }}>
                  Kiosk Mode & Admin PIN
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                  Locked down UI blocking refresh, browser back, context menu, and text selection. Hidden exit requiring encrypted Admin PIN with 5-attempt lockout security.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <AnalyticsIcon sx={{ color: '#34D399', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#F1F5F9' }}>
                  Instant Analytics & PDF
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                  Live turnout percentages, candidate pie/bar charts, department analytics, audit trail logs, and one-click PDF / Excel exports.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
