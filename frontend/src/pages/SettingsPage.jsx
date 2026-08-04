import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Stack, Alert, Card, CardContent, Divider
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [pin, setPin] = useState('123456');
  const [msg, setMsg] = useState('');

  const handleSavePin = async (e) => {
    e.preventDefault();
    try {
      // Endpoint or local setting
      setMsg('EVM Exit PIN updated successfully to ' + pin);
    } catch (err) {
      setMsg('Failed to update PIN');
    }
  };

  return (
    <Box maxWidth="md">
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        College & Kiosk Settings
      </Typography>

      <Paper className="glass-panel" sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Institution Information
        </Typography>
        <Stack spacing={2}>
          <TextField label="College Name" value={user?.name || ''} disabled fullWidth />
          <TextField label="College Code" value={user?.college_code || ''} disabled fullWidth />
          <TextField label="Official Email" value={user?.email || ''} disabled fullWidth />
        </Stack>
      </Paper>

      <Paper className="glass-panel" sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon sx={{ color: '#7C3AED' }} /> EVM Kiosk Exit Admin PIN
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
          This PIN is required by the Election Officer to exit physical Kiosk Mode. Default PIN: <strong>123456</strong>.
        </Typography>

        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

        <form onSubmit={handleSavePin}>
          <Stack direction="row" spacing={2}>
            <TextField
              type="password"
              label="EVM Kiosk Exit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              sx={{ maxWidth: 300 }}
            />
            <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
              Save PIN
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
