import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Button, Grid, Avatar, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';
import { boothAPI } from '../services/api';

export default function EVMScreen() {
  const navigate = useNavigate();

  // EVM States: 'VOTING', 'SAVING', 'THANKYOU'
  const [evmState, setEvmState] = useState('VOTING');
  const [electionId, setElectionId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activeCandidateId, setActiveCandidateId] = useState(null);

  // 3-second Reset Timer after voting
  const [countdown, setCountdown] = useState(3);

  // Admin PIN Exit Modal
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // Fullscreen Kiosk State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [electionTitle, setElectionTitle] = useState('');

  // Web Audio Context for EVM Beep
  const audioCtxRef = useRef(null);
  const pollTimerRef = useRef(null);
  const candidatesRef = useRef(candidates);
  candidatesRef.current = candidates;

  const evmStateRef = useRef(evmState);
  evmStateRef.current = evmState;

  // ──────────────────────────────────────────
  // FULLSCREEN API MANAGEMENT
  // ──────────────────────────────────────────

  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setIsFullscreen(true);
      document.body.classList.add('kiosk-fullscreen');
    } catch (err) {
      console.warn('Fullscreen request failed (requires user gesture):', err);
      setIsFullscreen(false);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      document.body.classList.remove('kiosk-fullscreen');
      setIsFullscreen(false);
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      setIsFullscreen(isFS);
      if (!isFS) {
        document.body.classList.remove('kiosk-fullscreen');
      } else {
        document.body.classList.add('kiosk-fullscreen');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.body.classList.remove('kiosk-fullscreen');
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 300);
    return () => clearTimeout(timer);
  }, [enterFullscreen]);

  // ──────────────────────────────────────────
  // INSTANT VOTE CASTING & BEEP SOUND
  // ──────────────────────────────────────────

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

  // Instant Vote Action on Candidate Click or Numpad Press (No Confirmation Required!)
  const handleVoteClick = useCallback(async (candidate) => {
    if (evmStateRef.current !== 'VOTING') return;

    setActiveCandidateId(candidate.id);
    setEvmState('SAVING');

    // 1. Play EVM Beep Sound Immediately
    playEvmBeep();

    // 2. Prepare Vote Data (Officer verified voter physically)
    const storedStudent = sessionStorage.getItem('unlocked_student');
    const student = storedStudent ? JSON.parse(storedStudent) : null;
    sessionStorage.removeItem('unlocked_student');

    const votes = [{
      position_id: candidate.position_id,
      candidate_id: candidate.id
    }];

    try {
      await boothAPI.castVote({
        student_id: student ? student.id : undefined,
        election_id: electionId,
        votes
      });

      // 3. Show Instant Vote Recorded Screen for 3s then return to voting
      setEvmState('THANKYOU');
    } catch (err) {
      console.error('Vote save error:', err);
      alert('Vote recording error. Ready for next attempt.');
      setEvmState('VOTING');
      setActiveCandidateId(null);
    }
  }, [electionId]);

  // ──────────────────────────────────────────
  // KEYBOARD LOCKDOWN — Pressing numpad 1-9 INSTANTLY casts vote
  // ──────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Always block dangerous shortcuts
      const blocked =
        e.key === 'F5' ||
        e.key === 'F11' ||
        e.key === 'F12' ||
        e.key === 'Escape' ||
        e.key === 'Tab' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.ctrlKey && e.key === 'w') ||
        (e.ctrlKey && e.key === 't') ||
        (e.ctrlKey && e.key === 'n') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.altKey && e.key === 'F4') ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'Meta';

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // If Admin PIN modal is open, allow PIN input typing
      if (exitModalOpen) {
        const activeEl = document.activeElement;
        const isInputFocused = activeEl && (activeEl.tagName === 'INPUT');
        if (isInputFocused && (/^[0-9]$/.test(e.key) || e.key === 'Backspace')) {
          return;
        }
        if (e.key === 'Enter') return;
      }

      // In VOTING state — Pressing candidate number (1-9) IMMEDIATELY casts vote!
      if (evmStateRef.current === 'VOTING') {
        const num = parseInt(e.key);
        const currentCandidates = candidatesRef.current;
        if (!isNaN(num) && num >= 1 && num <= currentCandidates.length) {
          e.preventDefault();
          const targetCandidate = currentCandidates[num - 1];
          if (targetCandidate) {
            handleVoteClick(targetCandidate);
          }
          return;
        }
      }

      // Block all other random keys during voting
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleContextMenu = (e) => { e.preventDefault(); return false; };
    const handleCopy = (e) => { e.preventDefault(); return false; };
    const handlePaste = (e) => { e.preventDefault(); return false; };
    const handleDragStart = (e) => { e.preventDefault(); return false; };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Election is in progress.';
      return e.returnValue;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [exitModalOpen, handleVoteClick]);

  // ──────────────────────────────────────────
  // BOOTH DATA & STATUS POLLING
  // ──────────────────────────────────────────

  const fetchBoothData = async () => {
    try {
      const res = await boothAPI.getData();
      if (res.data.active) {
        setElectionId(res.data.election.id);
        setElectionTitle(res.data.election.title);
        setPositions(res.data.positions);
        setCandidates(res.data.candidates);
      } else {
        exitFullscreen();
        navigate('/dashboard/elections');
      }
    } catch (err) {
      console.error('Booth data error:', err);
    }
  };

  useEffect(() => {
    fetchBoothData();

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await boothAPI.getData();
        if (!res.data.active) {
          exitFullscreen();
          navigate('/dashboard/elections');
        }
      } catch (err) {
        console.error('Election status poll error:', err);
      }
    }, 10000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [exitFullscreen, navigate]);

  // 3-Second Reset Countdown Effect after Vote Cast
  useEffect(() => {
    let timer;
    if (evmState === 'THANKYOU') {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setEvmState('VOTING');
            setActiveCandidateId(null);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [evmState]);

  // Admin PIN Exit Validation
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    try {
      const res = await boothAPI.verifyPin({ pin: pinInput });
      if (res.data.valid) {
        setExitModalOpen(false);
        exitFullscreen();
        navigate('/dashboard');
      }
    } catch (err) {
      const attempts = err.response?.data?.attempts_remaining;
      const locked = err.response?.data?.locked;

      if (locked) {
        setIsLocked(true);
        setPinError('Invalid PIN! Exit Option LOCKED after 5 failed attempts.');
      } else {
        setPinError(`Invalid PIN! Returning to voting screen... (${attempts} attempts left)`);
        setTimeout(() => {
          setExitModalOpen(false);
          setPinInput('');
          setPinError('');
        }, 2000);
      }
    }
  };

  // ──────────────────────────────────────────
  // RENDER: Fullscreen re-enter overlay if exited
  // ──────────────────────────────────────────

  if (!isFullscreen) {
    return (
      <div className="kiosk-reenter-overlay">
        <SecurityIcon sx={{ fontSize: 80, color: '#EF4444', mb: 3, opacity: 0.8 }} />
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#F1F5F9', mb: 1, textAlign: 'center' }}>
          ⚠ KIOSK MODE INTERRUPTED
        </Typography>
        <Typography variant="h6" sx={{ color: '#94A3B8', mb: 5, textAlign: 'center', maxWidth: 500 }}>
          Election is in progress. The voting terminal must operate in fullscreen mode.
        </Typography>
        <Button
          className="kiosk-reenter-btn kiosk-interactive"
          onClick={enterFullscreen}
        >
          <FullscreenIcon sx={{ mr: 1.5, fontSize: 28 }} />
          Re-Enter Fullscreen Kiosk
        </Button>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // MAIN EVM VOTING RENDER
  // ──────────────────────────────────────────

  return (
    <Box className="kiosk-mode-active" sx={{ minHeight: '100vh', bgcolor: '#070A13', color: '#fff', p: 3, position: 'relative' }}>
      {/* Top Bar / Kiosk Exit */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <HowToVoteIcon sx={{ color: '#10B981', fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1.2 }}>
              OFFICIAL ELECTRONIC VOTING MACHINE (EVM)
            </Typography>
            {electionTitle && (
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                ● LIVE ELECTION: {electionTitle}
              </Typography>
            )}
          </Box>
        </Stack>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ExitToAppIcon />}
          onClick={() => setExitModalOpen(true)}
          className="kiosk-interactive"
          sx={{ borderColor: 'rgba(255,255,255,0.2)', opacity: 0.8 }}
        >
          Exit Kiosk
        </Button>
      </Stack>

      {/* STATE 1: EVM BALLOT CANDIDATES LIST */}
      {(evmState === 'VOTING' || evmState === 'SAVING') && (
        <Container maxWidth="lg" sx={{ pt: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, p: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', borderRadius: 3, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="pulse-indicator" /> VOTING IN PROGRESS
            </Typography>
            <Typography variant="body1" sx={{ color: '#F1F5F9', fontWeight: 600 }}>
              Press Numpad Key <span style={{ color: '#10B981', fontWeight: 900, fontSize: '1.2rem' }}>[1-{candidates.length}]</span> or Click <span style={{ color: '#10B981', fontWeight: 900 }}>VOTE</span> to cast vote immediately
            </Typography>
          </Stack>

          {/* Candidates Vertical EVM List */}
          <Stack spacing={2}>
            {candidates.map((c, index) => {
              const isSelected = activeCandidateId === c.id;
              return (
                <Card
                  key={c.id}
                  sx={{
                    bgcolor: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(17, 24, 45, 0.85)',
                    border: isSelected ? '3px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    p: 2,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    {/* Index Numpad Key Indicator */}
                    <Grid item xs={1}>
                      <Box
                        sx={{
                          width: 52, height: 52, borderRadius: '50%',
                          bgcolor: isSelected ? '#10B981' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1.5rem',
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {index + 1}
                      </Box>
                    </Grid>

                    {/* Candidate Photo */}
                    <Grid item xs={2} sm={1}>
                      <Avatar
                        src={c.photo_url ? `http://localhost:5000${c.photo_url}` : undefined}
                        sx={{ width: 60, height: 60, bgcolor: '#7C3AED' }}
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
                        <Avatar src={`http://localhost:5000${c.symbol_url}`} sx={{ width: 48, height: 48, bgcolor: 'transparent' }} />
                      )}
                    </Grid>

                    {/* Large Green VOTE Button (Instant Cast on Click!) */}
                    <Grid item xs={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={evmState === 'SAVING'}
                        onClick={() => handleVoteClick(c)}
                        className="kiosk-interactive"
                        sx={{
                          py: 2,
                          bgcolor: isSelected ? '#059669' : '#10B981',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '1.3rem',
                          boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        {evmState === 'SAVING' && isSelected ? 'CASTING...' : 'VOTE'}
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              );
            })}
          </Stack>
        </Container>
      )}

      {/* STATE 2: INSTANT VOTE RECORDED (THANK YOU BEEP SCREEN) */}
      {evmState === 'THANKYOU' && (
        <Container maxWidth="md" sx={{ pt: 12, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 110, color: '#10B981', mb: 2, animation: 'pulse-green 1s infinite' }} />
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#F1F5F9', mb: 1 }}>
            ✔ VOTE RECORDED
          </Typography>
          <Typography variant="h4" sx={{ color: '#34D399', fontWeight: 700, mb: 4 }}>
            EVM Ballot Cast Successfully
          </Typography>

          <Card className="glass-panel" sx={{ p: 5, maxWidth: 450, mx: 'auto' }}>
            <Typography variant="h6" sx={{ color: '#94A3B8', mb: 2 }}>
              Ready for Next Voter
            </Typography>
            <Box
              sx={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 100, height: 100, borderRadius: '50%', border: '6px solid #10B981', mb: 2
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981' }}>
                {countdown}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Screen resets in {countdown} seconds...
            </Typography>
          </Card>
        </Container>
      )}

      {/* KIOSK LOCKDOWN BADGE */}
      <div className="kiosk-lockdown-badge">
        🔒 Physical Verification Active — Press Candidate Numpad [1-{candidates.length}] or Click VOTE
      </div>

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
              className="kiosk-interactive"
              autoFocus
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExitModalOpen(false)} className="kiosk-interactive">Cancel</Button>
            <Button type="submit" variant="contained" color="error" disabled={isLocked} className="kiosk-interactive">
              Unlock Exit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
