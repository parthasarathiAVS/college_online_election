import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, Button, Grid, Avatar, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { boothAPI } from '../services/api';

export default function EVMScreen() {
  const navigate = useNavigate();

  // EVM States: 'READY', 'VERIFYING', 'VOTING', 'THANKYOU', 'LOCKED_EXIT'
  const [evmState, setEvmState] = useState('READY');
  const [student, setStudent] = useState(null);
  const [electionId, setElectionId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({}); // { position_id: candidate_id }
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Verification Input (if officer unlocks on machine)
  const [regInput, setRegInput] = useState('');
  const [verifyErr, setVerifyErr] = useState('');

  // 20-second Timer
  const [countdown, setCountdown] = useState(20);

  // Admin PIN Exit Modal
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAttemptsRemaining, setPinAttemptsRemaining] = useState(5);
  const [isLocked, setIsLocked] = useState(false);

  // Web Audio Context for EVM Beep
  const audioCtxRef = useRef(null);

  useEffect(() => {
    fetchBoothData();

    // Check if unlocked from Officer Booth Control tab
    const storedStudent = sessionStorage.getItem('unlocked_student');
    const storedElecId = sessionStorage.getItem('unlocked_election_id');
    if (storedStudent && storedElecId) {
      setStudent(JSON.parse(storedStudent));
      setElectionId(parseInt(storedElecId));
      setEvmState('VOTING');
      sessionStorage.removeItem('unlocked_student');
      sessionStorage.removeItem('unlocked_election_id');
    }
  }, []);

  // Play authentic 1-second 1000Hz EVM beep
  const playEvmBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime); // 1000Hz standard EVM beep
      gain.gain.setValueAtTime(0.8, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.0); // Exactly 1 second
    } catch (e) {
      console.error('Audio beep error:', e);
    }
  };

  const fetchBoothData = async () => {
    try {
      const res = await boothAPI.getData();
      if (res.data.active) {
        setElectionId(res.data.election.id);
        setPositions(res.data.positions);
        setCandidates(res.data.candidates);
      }
    } catch (err) {
      console.error('Booth data error:', err);
    }
  };

  // Kiosk Event Blockers (F5, Ctrl+R, Context Menu, Copy/Paste)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Disable F5 & Ctrl+R
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        return false;
      }

      // Numpad Voting Keyboard Navigation (1-9 & Enter)
      if (evmState === 'VOTING') {
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= candidates.length) {
          e.preventDefault();
          setHighlightedIndex(num - 1);
        } else if (e.key === 'Enter' && candidates[highlightedIndex]) {
          e.preventDefault();
          handleVoteClick(candidates[highlightedIndex]);
        }
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [evmState, candidates, highlightedIndex]);

  // 20 Second Reset Countdown Effect
  useEffect(() => {
    let timer;
    if (evmState === 'THANKYOU') {
      setCountdown(20);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            resetToReady();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [evmState]);

  const resetToReady = () => {
    setStudent(null);
    setSelectedVotes({});
    setEvmState('READY');
    setRegInput('');
    setVerifyErr('');
  };

  // Student Verify locally
  const handleLocalVerify = async (e) => {
    e.preventDefault();
    setVerifyErr('');
    try {
      const res = await boothAPI.verifyStudent({ register_number: regInput });
      if (res.data.eligible) {
        setStudent(res.data.student);
        setElectionId(res.data.election_id);
        setEvmState('VOTING');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setVerifyErr('ALREADY VOTED! This student has already cast a vote.');
      } else {
        setVerifyErr(err.response?.data?.message || 'Verification failed');
      }
    }
  };

  // Cast Vote Action
  const handleVoteClick = async (candidate) => {
    if (evmState !== 'VOTING') return;

    // 1. Play Authentic Beep
    playEvmBeep();

    // 2. Lock UI & Instant Save Vote
    setEvmState('SAVING');

    const votes = [{
      position_id: candidate.position_id,
      candidate_id: candidate.id
    }];

    try {
      await boothAPI.castVote({
        student_id: student.id,
        election_id: electionId,
        votes
      });

      // Move to Thank You & start 20s countdown
      setTimeout(() => {
        setEvmState('THANKYOU');
      }, 1000); // match 1s beep duration
    } catch (err) {
      alert('Failed to record vote. Returning to ready.');
      resetToReady();
    }
  };

  // Admin PIN Exit Validation
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    try {
      const res = await boothAPI.verifyPin({ pin: pinInput });
      if (res.data.valid) {
        setExitModalOpen(false);
        navigate('/dashboard');
      }
    } catch (err) {
      const attempts = err.response?.data?.attempts_remaining;
      const locked = err.response?.data?.locked;

      if (locked) {
        setIsLocked(true);
        setPinError('Invalid PIN! Exit Option LOCKED after 5 failed attempts.');
      } else {
        setPinError(`Invalid PIN! Returning to voting screen in 2 seconds... (${attempts} attempts left)`);
        setTimeout(() => {
          setExitModalOpen(false);
          setPinInput('');
          setPinError('');
        }, 2000);
      }
    }
  };

  return (
    <Box className="kiosk-mode-active" sx={{ minHeight: '100vh', bgcolor: '#070A13', color: '#fff', p: 3, position: 'relative' }}>
      {/* Top Bar / Hidden Kiosk Exit Target */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <HowToVoteIcon sx={{ color: '#10B981', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '0.05em' }}>
            OFFICIAL ELECTRONIC VOTING MACHINE (EVM)
          </Typography>
        </Stack>

        {/* Hidden Exit Button for Election Officer */}
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ExitToAppIcon />}
          onClick={() => setExitModalOpen(true)}
          sx={{ borderColor: 'rgba(255,255,255,0.2)', opacity: 0.8 }}
        >
          Exit Kiosk
        </Button>
      </Stack>

      {/* STATE 1: READY SCREEN */}
      {evmState === 'READY' && (
        <Container maxWidth="md" sx={{ pt: 10, textAlign: 'center' }}>
          <Box className="pulse-indicator" sx={{ mx: 'auto', width: 30, height: 30, mb: 3 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981', mb: 2 }}>
            🟢 READY FOR NEXT VOTER
          </Typography>
          <Typography variant="h6" sx={{ color: '#94A3B8', mb: 6 }}>
            Waiting for Election Officer Verification...
          </Typography>

          {/* Quick Local Verify Card */}
          <Card className="glass-panel" sx={{ p: 4, maxWidth: 500, mx: 'auto', textAlign: 'left' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Officer Verification Keypad
            </Typography>
            {verifyErr && <Alert severity="error" sx={{ mb: 2 }}>{verifyErr}</Alert>}
            <form onSubmit={handleLocalVerify}>
              <TextField
                fullWidth
                label="Student Register Number"
                value={regInput}
                onChange={(e) => setRegInput(e.target.value)}
                placeholder="Enter Register Number"
                sx={{ mb: 3 }}
                autoFocus
              />
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ py: 1.5, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
                Unlock EVM for Student
              </Button>
            </form>
          </Card>
        </Container>
      )}

      {/* STATE 2: EVM CANDIDATES SCREEN */}
      {(evmState === 'VOTING' || evmState === 'SAVING') && (
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, p: 2, bgcolor: 'rgba(124, 58, 237, 0.15)', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Voter: <span style={{ color: '#A78BFA' }}>{student?.name}</span> ({student?.register_number})
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Press Numpad [1-{candidates.length}] or Click <span style={{ color: '#10B981', fontWeight: 'bold' }}>VOTE</span>
            </Typography>
          </Stack>

          {/* Candidates Vertical EVM List */}
          <Stack spacing={2}>
            {candidates.map((c, index) => {
              const isHighlighted = highlightedIndex === index;
              return (
                <Card
                  key={c.id}
                  sx={{
                    bgcolor: isHighlighted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(17, 24, 45, 0.85)',
                    border: isHighlighted ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    p: 2,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    {/* Index Numpad Number */}
                    <Grid item xs={1}>
                      <Box
                        sx={{
                          width: 48, height: 48, borderRadius: '50%',
                          bgcolor: isHighlighted ? '#10B981' : 'rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1.4rem'
                        }}
                      >
                        {index + 1}
                      </Box>
                    </Grid>

                    {/* Candidate Photo & Symbol */}
                    <Grid item xs={2} sm={1}>
                      <Avatar
                        src={c.photo_url ? `http://localhost:5000${c.photo_url}` : undefined}
                        sx={{ width: 56, height: 56, bgcolor: '#7C3AED' }}
                      />
                    </Grid>

                    {/* Candidate Details */}
                    <Grid item xs={6} sm={7}>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{c.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {c.Position?.name} | Dept: {c.Department?.name}
                      </Typography>
                    </Grid>

                    {/* Election Symbol */}
                    <Grid item xs={1}>
                      {c.symbol_url && (
                        <Avatar src={`http://localhost:5000${c.symbol_url}`} sx={{ width: 44, height: 44, bgcolor: 'transparent' }} />
                      )}
                    </Grid>

                    {/* Large Green VOTE Button */}
                    <Grid item xs={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={evmState === 'SAVING'}
                        onClick={() => handleVoteClick(c)}
                        sx={{
                          py: 2,
                          bgcolor: '#10B981',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        {evmState === 'SAVING' ? 'SAVING...' : 'VOTE'}
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              );
            })}
          </Stack>
        </Container>
      )}

      {/* STATE 3: THANK YOU & 20 SECOND RESET SCREEN */}
      {evmState === 'THANKYOU' && (
        <Container maxWidth="md" sx={{ pt: 10, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 100, color: '#10B981', mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#F1F5F9', mb: 1 }}>
            ✔ Thank You
          </Typography>
          <Typography variant="h4" sx={{ color: '#34D399', fontWeight: 700, mb: 4 }}>
            Your Vote Has Been Recorded
          </Typography>

          <Card className="glass-panel" sx={{ p: 5, maxWidth: 450, mx: 'auto' }}>
            <Typography variant="h6" sx={{ color: '#94A3B8', mb: 2 }}>
              Preparing Next Voter...
            </Typography>
            <Box
              sx={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 120, height: 120, borderRadius: '50%', border: '6px solid #10B981', mb: 2
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981' }}>
                {countdown}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Screen automatically clears and locks in {countdown} seconds.
            </Typography>
          </Card>
        </Container>
      )}

      {/* ADMIN PIN EXIT MODAL */}
      <Dialog open={exitModalOpen} onClose={() => setExitModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color="primary" /> Exit Kiosk Mode
        </DialogTitle>
        <form onSubmit={handlePinSubmit}>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
              Election Officer must enter the Admin PIN to return to the Dashboard.
            </Typography>

            {pinError && <Alert severity="error" sx={{ mb: 2 }}>{pinError}</Alert>}

            <TextField
              fullWidth
              type="password"
              label="Admin PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              disabled={isLocked}
              autoFocus
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExitModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="error" disabled={isLocked}>
              Unlock Exit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
