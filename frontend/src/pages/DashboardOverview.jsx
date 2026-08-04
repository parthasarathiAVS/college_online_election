import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, Chip, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BallotIcon from '@mui/icons-material/Ballot';
import PollIcon from '@mui/icons-material/Poll';
import PercentIcon from '@mui/icons-material/Percent';
import ConnectedTvIcon from '@mui/icons-material/ConnectedTv';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockResetIcon from '@mui/icons-material/LockReset';
import { reportsAPI, boothAPI } from '../services/api';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Students */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(59, 130, 246, 0.2)' }}>
                <PeopleIcon sx={{ color: '#60A5FA', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Total Students</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalStudents || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Candidates */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(124, 58, 237, 0.2)' }}>
                <HowToVoteIcon sx={{ color: '#A78BFA', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Total Candidates</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalCandidates || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Election */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.2)' }}>
                <BallotIcon sx={{ color: '#FBBF24', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Active Election</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: stats?.activeElection !== 'None' ? '#34D399' : '#F1F5F9' }}>
                  {stats?.activeElection}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Votes Cast */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.2)' }}>
                <PollIcon sx={{ color: '#34D399', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Votes Cast</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.votesCast || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Turnout Percentage */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(236, 72, 153, 0.2)' }}>
                <PercentIcon sx={{ color: '#F472B6', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Turnout Percentage</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.turnout || '0.0'}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booth Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(6, 182, 212, 0.2)' }}>
                <ConnectedTvIcon sx={{ color: '#22D3EE', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Booth Status</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={stats?.boothStatus}
                    color={stats?.boothStatus === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                  {stats?.is_exit_locked && (
                    <Chip label="Exit Locked!" color="error" size="small" />
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Launch EVM Kiosk */}
      <Card className="glass-panel" sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Physical Kiosk Voting Mode
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Launch the fullscreen EVM machine terminal for physical campus voting.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={() => navigate('/evm-kiosk')}
              sx={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              Launch EVM Kiosk
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/dashboard/booth')}
            >
              Booth Control Panel
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
