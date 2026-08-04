import React from 'react';
import { Box, Container, Stack, Typography, IconButton, Chip } from '@mui/material';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import CircleIcon from '@mui/icons-material/Circle';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== 'college_admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F1A' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - 260px)`, overflowX: 'hidden' }}>
        {/* Top Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mb: 4,
            pb: 2,
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#F1F5F9' }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Code: <strong>{user.college_code}</strong> | Official Campus Voting Portal
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<CircleIcon sx={{ fontSize: 10, color: '#10B981 !important' }} />}
              label="System Operational"
              variant="outlined"
              sx={{
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#34D399',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }}
            />
          </Stack>
        </Stack>

        <Outlet />
      </Box>
    </Box>
  );
}
