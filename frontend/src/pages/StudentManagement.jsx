import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Stack, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import { studentsAPI, departmentsAPI } from '../services/api';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Add / Edit Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    register_number: '', name: '', department_id: '', year: 1, status: 'active'
  });
  const [modalError, setModalError] = useState('');

  // Import Modal
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, deptFilter, yearFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data.departments);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsAPI.getAll({
        search, department: deptFilter, year: yearFilter
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      register_number: '', name: '', department_id: departments[0]?.id || '', year: 1, status: 'active'
    });
    setModalError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      register_number: student.register_number,
      name: student.name,
      department_id: student.department_id,
      year: student.year,
      status: student.status
    });
    setModalError('');
    setOpenModal(true);
  };

  const handleSaveStudent = async () => {
    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, formData);
      } else {
        await studentsAPI.add(formData);
      }
      setOpenModal(false);
      fetchStudents();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student record?')) {
      await studentsAPI.delete(id);
      fetchStudents();
    }
  };

  const handleExport = async () => {
    const res = await studentsAPI.export();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students.xlsx');
    document.body.appendChild(link);
    link.click();
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    try {
      const data = new FormData();
      data.append('file', importFile);
      const res = await studentsAPI.import(data);
      setImportMsg(res.data.message);
      fetchStudents();
      setTimeout(() => setImportOpen(false), 2000);
    } catch (err) {
      setImportMsg(err.response?.data?.message || 'Import failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      {/* Action Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Student Management
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Add Student
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setImportOpen(true)}>
            Import Excel
          </Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
            Export Excel
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper className="glass-panel" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search by Name or Reg Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} />
            }}
          />
          <TextField
            select
            label="Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Years</MenuItem>
            <MenuItem value="1">1st Year</MenuItem>
            <MenuItem value="2">2nd Year</MenuItem>
            <MenuItem value="3">3rd Year</MenuItem>
            <MenuItem value="4">4th Year</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Student Table */}
      <TableContainer component={Paper} className="glass-panel">
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Register Number</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Has Voted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: '#94A3B8' }}>
                    No student records found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{s.register_number}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.Department?.name || '-'}</TableCell>
                    <TableCell>{s.year} Year</TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        color={s.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.has_voted ? 'Voted ✔' : 'Not Voted'}
                        color={s.has_voted ? 'primary' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(s)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
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

      {/* Add / Edit Student Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Register Number"
              value={formData.register_number}
              onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Student Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
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
              select
              label="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              fullWidth
            >
              <MenuItem value={1}>1st Year</MenuItem>
              <MenuItem value={2}>2nd Year</MenuItem>
              <MenuItem value={3}>3rd Year</MenuItem>
              <MenuItem value={4}>4th Year</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSaveStudent} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)}>
        <DialogTitle>Import Students from Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            Upload an Excel (.xlsx) file with headers: "Register Number", "Student Name", "Department", "Year".
          </Typography>
          {importMsg && <Alert severity="info" sx={{ mb: 2 }}>{importMsg}</Alert>}
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setImportFile(e.target.files[0])} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button onClick={handleImportSubmit} variant="contained">Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
