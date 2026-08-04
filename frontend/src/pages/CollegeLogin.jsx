import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Card, CardContent,
  Alert, CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useAuth } from '../contexts/AuthContext';

export default function CollegeLogin() {
  const navigate = useNavigate();
  const { loginCollege } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await loginCollege(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Card className="glass-panel" sx={{ p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5
              }}
            >
              <HowToVoteIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              College Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Sign in to manage your campus elections
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="College Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login to Dashboard'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Don't have a college account?{' '}
              <Link to="/register" style={{ color: '#A78BFA' }}>Register here</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
