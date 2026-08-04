import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid, Card, CardContent,
  Alert, Stack, CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { authAPI } from '../services/api';

export default function CollegeRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    college_code: '',
    principal_name: '',
    election_officer: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    password: '',
    confirm_password: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirm_password') data.append(key, formData[key]);
      });
      if (logoFile) {
        data.append('logo', logoFile);
      }

      await authAPI.register(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card className="glass-panel" sx={{ p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <HowToVoteIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              College Registration
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
              Register your educational institution to launch physical EVM kiosk voting.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                College Account Created Successfully! Status: <strong>Pending Approval</strong>
              </Alert>
              <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
                Your registration has been submitted to the Super Admin. Once approved, you can log in using your college email and password.
              </Typography>
              <Button component={Link} to="/login" variant="contained">
                Go to College Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="College Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="College Code (e.g. MIT-001)"
                    name="college_code"
                    value={formData.college_code}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Principal Name"
                    name="principal_name"
                    value={formData.principal_name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Election Officer Name"
                    name="election_officer"
                    value={formData.election_officer}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="College Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website URL"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{ height: '56px', borderColor: 'rgba(148, 163, 184, 0.2)' }}
                  >
                    {logoFile ? logoFile.name : 'Upload College Logo'}
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm Password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ px: 6, py: 1.5, fontSize: '1rem' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create College Account'}
                </Button>
                <Typography variant="body2" sx={{ color: '#94A3B8', mt: 2 }}>
                  Already registered? <Link to="/login" style={{ color: '#A78BFA' }}>Login here</Link>
                </Typography>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
