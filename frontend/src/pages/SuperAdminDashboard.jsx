import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, Alert, Tabs, Tab, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import BallotIcon from '@mui/icons-material/Ballot';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import StorageIcon from '@mui/icons-material/Storage';
import LogoutIcon from '@mui/icons-material/Logout';
import { superAdminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, collegesRes] = await Promise.all([
        superAdminAPI.getAnalytics(),
        superAdminAPI.getColleges(tab === 'all' ? undefined : tab)
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setColleges(collegesRes.data.colleges);
    } catch (err) {
      setError('Failed to load Super Admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await superAdminAPI.approve(id);
    fetchData();
  };

  const handleReject = async (id) => {
    await superAdminAPI.reject(id);
    fetchData();
  };

  const handleSuspend = async (id) => {
    await superAdminAPI.suspend(id);
    fetchData();
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await superAdminAPI.deleteCollege(deleteConfirm);
      setDeleteConfirm(null);
      fetchData();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0B0F1A', p: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Super Admin Management Console
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Global VoteVerse AI Platform Analytics & College Approval Control
            </Typography>
          </Box>
          <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Exit Super Admin
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Analytics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(124, 58, 237, 0.2)' }}>
                  <SchoolIcon sx={{ color: '#A78BFA', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Total Colleges</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{analytics?.totalColleges || 0}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(59, 130, 246, 0.2)' }}>
                  <BallotIcon sx={{ color: '#60A5FA', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Total Elections</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{analytics?.totalElections || 0}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.2)' }}>
                  <HowToVoteIcon sx={{ color: '#34D399', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Total Votes Cast</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{analytics?.totalVotes || 0}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.2)' }}>
                  <StorageIcon sx={{ color: '#FBBF24', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Storage Usage</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>14.2 MB</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Colleges Table */}
        <Paper className="glass-panel" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              College Institutions Management
            </Typography>
            <Tabs
              value={tab}
              onChange={(e, val) => setTab(val)}
              textColor="secondary"
              indicatorColor="secondary"
            >
              <Tab label="All" value="all" />
              <Tab label="Pending" value="pending" />
              <Tab label="Approved" value="approved" />
              <Tab label="Suspended" value="suspended" />
            </Tabs>
          </Stack>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>College Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Principal</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colleges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: '#94A3B8' }}>
                        No colleges found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    colleges.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                        <TableCell>{c.college_code}</TableCell>
                        <TableCell>{c.principal_name}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={c.status.toUpperCase()}
                            color={
                              c.status === 'approved' ? 'success' :
                              c.status === 'pending' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {c.status !== 'approved' && (
                              <Button
                                size="small"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApprove(c.id)}
                              >
                                Approve
                              </Button>
                            )}
                            {c.status === 'pending' && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleReject(c.id)}
                              >
                                Reject
                              </Button>
                            )}
                            {c.status === 'approved' && (
                              <Button
                                size="small"
                                color="warning"
                                startIcon={<BlockIcon />}
                                onClick={() => handleSuspend(c.id)}
                              >
                                Suspend
                              </Button>
                            )}
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm(c.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Confirm Delete Dialog */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm College Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to permanently delete this college and all associated data?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
