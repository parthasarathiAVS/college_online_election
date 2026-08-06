import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { electionsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ElectionManagement() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await electionsAPI.getAll();
      setElections(res.data.elections);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingElection(null);
    setFormData({ title: '', description: '' });
    setError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (e) => {
    setEditingElection(e);
    setFormData({ title: e.title, description: e.description || '' });
    setError('');
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingElection) {
        await electionsAPI.update(editingElection.id, formData);
      } else {
        await electionsAPI.create(formData);
      }
      setOpenModal(false);
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || 'Save election failed');
    }
  };

  const handleStatusAction = async (id, action) => {
    try {
      await electionsAPI.changeStatus(id, action);
      if (action === 'start') {
        navigate('/evm-kiosk');
      } else {
        fetchElections();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete election?')) {
      try {
        await electionsAPI.delete(id);
        fetchElections();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const getStatusChip = (status, published) => {
    const map = {
      draft: { label: 'Draft', color: 'default' },
      scheduled: { label: 'Scheduled', color: 'info' },
      active: { label: 'LIVE ACTIVE', color: 'success' },
      paused: { label: 'Paused', color: 'warning' },
      completed: { label: published ? 'Completed & Published' : 'Completed', color: published ? 'primary' : 'secondary' },
      archived: { label: 'Archived', color: 'default' }
    };
    const config = map[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} sx={{ fontWeight: 700 }} />;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Election Lifecycle Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Create Election
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {elections.length === 0 ? (
            <Grid item xs={12}>
              <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', color: '#94A3B8' }}>
                No elections created yet. Click "Create Election" to get started.
              </Paper>
            </Grid>
          ) : (
            elections.map((e) => (
              <Grid item xs={12} key={e.id}>
                <Card className="glass-card" sx={{ p: 1 }}>
                  <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                      <Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{e.title}</Typography>
                          {getStatusChip(e.status, e.result_published)}
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                          {e.description || 'No description provided.'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#A78BFA' }}>
                          Votes Cast: <strong>{e.vote_count}</strong> / {e.total_students} students ({e.turnout}% turnout)
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(e.status === 'draft' || e.status === 'paused') && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleStatusAction(e.id, 'start')}
                          >
                            Start Election
                          </Button>
                        )}
                        {e.status === 'active' && (
                          <>
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<PauseIcon />}
                              onClick={() => handleStatusAction(e.id, 'pause')}
                            >
                              Pause
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<StopIcon />}
                              onClick={() => handleStatusAction(e.id, 'end')}
                            >
                              End Election
                            </Button>
                          </>
                        )}
                        {e.status === 'completed' && !e.result_published && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<PublishIcon />}
                            onClick={() => handleStatusAction(e.id, 'publish')}
                          >
                            Publish Results
                          </Button>
                        )}
                        {e.status === 'completed' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ArchiveIcon />}
                            onClick={() => handleStatusAction(e.id, 'archive')}
                          >
                            Archive
                          </Button>
                        )}
                        <Button size="small" onClick={() => handleOpenEdit(e)}>
                          Edit
                        </Button>
                        {e.status !== 'active' && (
                          <Button size="small" color="error" onClick={() => handleDelete(e.id)}>
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingElection ? 'Edit Election' : 'Create Election'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Election Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
