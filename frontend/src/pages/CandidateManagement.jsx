import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, TextField, Stack,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Alert, Avatar, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { candidatesAPI, departmentsAPI, positionsAPI, electionsAPI } from '../services/api';

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({
    name: '', election_id: '', department_id: '', position_id: '',
    manifesto: '', achievements: '', display_order: 0
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [symbolFile, setSymbolFile] = useState(null);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedElection) fetchCandidates();
  }, [selectedElection]);

  const fetchInitial = async () => {
    try {
      const [deptRes, posRes, elecRes] = await Promise.all([
        departmentsAPI.getAll(),
        positionsAPI.getAll(),
        electionsAPI.getAll()
      ]);
      setDepartments(deptRes.data.departments);
      setPositions(posRes.data.positions);
      setElections(elecRes.data.elections);

      if (elecRes.data.elections.length > 0) {
        setSelectedElection(elecRes.data.elections[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidatesAPI.getAll({ election_id: selectedElection });
      setCandidates(res.data.candidates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormData({
      name: '',
      election_id: selectedElection,
      department_id: departments[0]?.id || '',
      position_id: positions[0]?.id || '',
      manifesto: '',
      achievements: '',
      display_order: candidates.length + 1
    });
    setPhotoFile(null);
    setSymbolFile(null);
    setModalError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (cand) => {
    setEditingCandidate(cand);
    setFormData({
      name: cand.name,
      election_id: cand.election_id,
      department_id: cand.department_id,
      position_id: cand.position_id,
      manifesto: cand.manifesto || '',
      achievements: cand.achievements || '',
      display_order: cand.display_order
    });
    setPhotoFile(null);
    setSymbolFile(null);
    setModalError('');
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (photoFile) data.append('photo', photoFile);
      if (symbolFile) data.append('symbol', symbolFile);

      if (editingCandidate) {
        await candidatesAPI.update(editingCandidate.id, data);
      } else {
        await candidatesAPI.add(data);
      }

      setOpenModal(false);
      fetchCandidates();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Save candidate failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete candidate?')) {
      await candidatesAPI.delete(id);
      fetchCandidates();
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Candidate Management
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Select Election"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
          >
            {elections.map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} disabled={!selectedElection}>
            Add Candidate
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {candidates.length === 0 ? (
            <Grid item xs={12}>
              <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', color: '#94A3B8' }}>
                No candidates registered for this election yet.
              </Paper>
            </Grid>
          ) : (
            candidates.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar
                        src={c.photo_url ? `http://localhost:5000${c.photo_url}` : undefined}
                        sx={{ width: 64, height: 64, bgcolor: '#7C3AED' }}
                      >
                        {c.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                        <Chip label={c.Position?.name || 'Candidate'} size="small" color="primary" sx={{ mb: 0.5 }} />
                        <Typography variant="caption" display="block" sx={{ color: '#94A3B8' }}>
                          Dept: {c.Department?.name}
                        </Typography>
                      </Box>
                      {c.symbol_url && (
                        <Avatar src={`http://localhost:5000${c.symbol_url}`} sx={{ width: 40, height: 40, bgcolor: 'transparent' }} />
                      )}
                    </Stack>

                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                      <strong>Manifesto:</strong> {c.manifesto || 'No manifesto added.'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      <strong>Achievements:</strong> {c.achievements || 'N/A'}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCandidate ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
        <DialogContent>
          {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Candidate Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Position"
              value={formData.position_id}
              onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
              fullWidth
              required
            >
              {positions.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Department"
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              fullWidth
              required
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              multiline
              rows={2}
              label="Manifesto"
              value={formData.manifesto}
              onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
              fullWidth
            />
            <TextField
              multiline
              rows={2}
              label="Achievements"
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              fullWidth
            />
            <TextField
              type="number"
              label="Display Order (EVM Sequence)"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
              fullWidth
            />
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              {photoFile ? photoFile.name : 'Upload Candidate Photo'}
              <input type="file" hidden accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
            </Button>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              {symbolFile ? symbolFile.name : 'Upload Election Symbol'}
              <input type="file" hidden accept="image/*" onChange={(e) => setSymbolFile(e.target.files[0])} />
            </Button>
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
