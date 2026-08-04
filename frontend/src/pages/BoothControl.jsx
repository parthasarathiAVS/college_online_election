import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, TextField, Stack,
  Alert, Chip, CircularProgress, Divider
} from '@mui/material';
import ConnectedTvIcon from '@mui/icons-material/ConnectedTv';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockResetIcon from '@mui/icons-material/LockReset';
import LaunchIcon from '@mui/icons-material/Launch';
import { boothAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function BoothControl() {
  const navigate = useNavigate();
  const [regNumber, setRegNumber] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoothStatus();
    const interval = setInterval(fetchBoothStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBoothStatus = async () => {
    try {
      const res = await boothAPI.getStatus();
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyResult(null);

    if (!regNumber.trim()) return;

    try {
      setVerifying(true);
      const res = await boothAPI.verifyStudent({ register_number: regNumber.trim() });
      setVerifyResult(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setVerifyResult({ already_voted: true, message: 'Already Voted', student_name: err.response.data.student_name });
      } else {
        setError(err.response?.data?.message || 'Verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResetLock = async () => {
    try {
      await boothAPI.resetLock();
      fetchBoothStatus();
      alert('EVM Kiosk exit lock has been reset.');
    } catch (err) {
      alert('Failed to reset lock');
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <Box maxWidth="lg">
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Voting Booth Control & Verification Panel
      </Typography>

      <Grid container spacing={3}>
        {/* Verification Column */}
        <Grid item xs={12} md={7}>
          <Card className="glass-panel" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserIcon sx={{ color: '#7C3AED' }} /> Officer Student Verification
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
              Enter student Register Number to verify eligibility and unlock the EVM terminal.
            </Typography>

            <form onSubmit={handleVerify}>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Student Register Number"
                  placeholder="e.g. MITCS001"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={verifying}
                  sx={{ px: 4, whiteSpace: 'nowrap' }}
                >
                  {verifying ? <CircularProgress size={24} /> : 'Verify Student'}
                </Button>
              </Stack>
            </form>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {verifyResult && (
              <Box sx={{ mt: 3, p: 3, borderRadius: 3, bgcolor: verifyResult.already_voted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid', borderColor: verifyResult.already_voted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}>
                {verifyResult.already_voted ? (
                  <Stack spacing={1}>
                    <Typography variant="h6" color="error" sx={{ fontWeight: 800 }}>
                      🚫 ALREADY VOTED
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F1F5F9' }}>
                      Student: <strong>{verifyResult.student_name || regNumber}</strong> has already recorded a vote in this election.
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    <Typography variant="h6" color="success.light" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LockOpenIcon /> VOTER ELIGIBLE & VERIFIED
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#F1F5F9' }}>
                      Name: <strong>{verifyResult.student?.name}</strong> ({verifyResult.student?.register_number})
                    </Typography>

                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<ConnectedTvIcon />}
                      onClick={() => {
                        sessionStorage.setItem('unlocked_student', JSON.stringify(verifyResult.student));
                        sessionStorage.setItem('unlocked_election_id', verifyResult.election_id);
                        navigate('/evm-kiosk');
                      }}
                      sx={{ py: 1.5, mt: 1 }}
                    >
                      Unlock Voting Machine Now
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Booth Status Column */}
        <Grid item xs={12} md={5}>
          <Card className="glass-panel" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              EVM Terminal Status
            </Typography>

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Active Election</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {status?.election ? status.election.title : 'No Active Election'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Votes Cast</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#34D399' }}>
                  {status?.stats?.voteCount || 0} / {status?.stats?.totalStudents || 0}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>Exit PIN Security Lock</Typography>
                {status?.is_exit_locked ? (
                  <Alert severity="error" action={
                    <Button color="inherit" size="small" startIcon={<LockResetIcon />} onClick={handleResetLock}>
                      Reset Lock
                    </Button>
                  }>
                    EVM Exit is LOCKED due to 5 failed PIN attempts!
                  </Alert>
                ) : (
                  <Chip
                    label={`Failed Exit Attempts: ${status?.failed_exit_attempts || 0} / 5`}
                    color={status?.failed_exit_attempts > 0 ? 'warning' : 'success'}
                  />
                )}
              </Box>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                endIcon={<LaunchIcon />}
                onClick={() => navigate('/evm-kiosk')}
                sx={{ py: 1.5 }}
              >
                Open Local EVM Kiosk Window
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
