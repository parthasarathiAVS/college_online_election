import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SecurityIcon from '@mui/icons-material/Security';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        background: 'rgba(11, 15, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
          {/* Logo */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
              }}
            >
              <HowToVoteIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>
                VoteVerse <span style={{ color: '#7C3AED' }}>AI</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>
                Smart Campus Democracy
              </Typography>
            </Box>
          </Stack>

          {/* Navigation Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button component={Link} to="/login" variant="text" sx={{ color: '#F1F5F9' }}>
              College Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                borderRadius: '10px',
                px: 3,
                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)'
              }}
            >
              Register College
            </Button>
            <Button
              component={Link}
              to="/superadmin/login"
              size="small"
              sx={{ color: '#94A3B8', textTransform: 'none', fontSize: '0.8rem' }}
              startIcon={<SecurityIcon fontSize="small" />}
            >
              Super Admin
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
