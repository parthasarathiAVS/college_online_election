import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { positionsAPI, electionsAPI } from '../services/api';

export default function PositionManagement() {
  const [positions, setPositions] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [formData, setFormData] = useState({ name: '', election_id: '', display_order: 1 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) fetchPositions();
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const res = await electionsAPI.getAll();
      setElections(res.data.elections);
      if (res.data.elections.length > 0) {
        setSelectedElection(res.data.elections[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await positionsAPI.getAll({ election_id: selectedElection });
      setPositions(res.data.positions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPos(null);
    setFormData({ name: '', election_id: selectedElection, display_order: positions.length + 1 });
    setError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (pos) => {
    setEditingPos(pos);
    setFormData({ name: pos.name, election_id: pos.election_id, display_order: pos.display_order });
    setError('');
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPos) {
        await positionsAPI.update(editingPos.id, formData);
      } else {
        await positionsAPI.add(formData);
      }
      setOpenModal(false);
      fetchPositions();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete position?')) {
      await positionsAPI.delete(id);
      fetchPositions();
    }
  };

  return (
    <Box maxWidth="md">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Positions Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Election"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            {elections.map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} disabled={!selectedElection}>
            Add Position
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper} className="glass-panel">
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Display Order</TableCell>
                <TableCell>Position Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: '#94A3B8' }}>
                    No positions configured for this election.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell sx={{ fontWeight: 600 }}>#{p.display_order}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(p)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>{editingPos ? 'Edit Position' : 'Add Position'}</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 350 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Position Name (e.g. President)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              type="number"
              label="Display Order"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
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
