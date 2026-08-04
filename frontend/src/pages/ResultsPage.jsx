import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem,
  TextField, Avatar, CircularProgress, Alert
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import { reportsAPI, electionsAPI } from '../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ResultsPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) fetchResults();
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

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportsAPI.getResults(selectedElection);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load election results');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    const res = await reportsAPI.exportResults(selectedElection);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `results_election_${selectedElection}.xlsx`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Election Results & Analytics
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Select Election"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            size="small"
            sx={{ minWidth: 240 }}
          >
            {elections.map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel} disabled={!data}>
            Export Excel
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!data}>
            Print
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="warning" sx={{ p: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
      ) : !data ? null : (
        <Grid container spacing={3}>
          {/* Winner Cards */}
          {data.results.map((posRes) => {
            const winner = posRes.winner;
            if (!winner || winner.votes === 0) return null;

            const chartData = {
              labels: posRes.candidates.map(c => c.name),
              datasets: [{
                label: 'Votes',
                data: posRes.candidates.map(c => c.votes),
                backgroundColor: [
                  'rgba(124, 58, 237, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)'
                ],
                borderRadius: 8
              }]
            };

            return (
              <Grid item xs={12} key={posRes.position.id}>
                <Paper className="glass-panel" sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#A78BFA' }}>
                    Position: {posRes.position.name}
                  </Typography>

                  <Grid container spacing={3} alignItems="center">
                    {/* Winner Details */}
                    <Grid item xs={12} md={5}>
                      <Card sx={{ bgcolor: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', p: 2 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <EmojiEventsIcon sx={{ fontSize: 56, color: '#FBBF24', mb: 1 }} />
                          <Typography variant="overline" display="block" sx={{ color: '#FBBF24', fontWeight: 800 }}>
                            WINNER ELECTED
                          </Typography>
                          <Avatar
                            src={winner.photo_url ? `http://localhost:5000${winner.photo_url}` : undefined}
                            sx={{ width: 80, height: 80, mx: 'auto', mb: 1.5, border: '3px solid #FBBF24' }}
                          />
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>{winner.name}</Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5 }}>
                            Dept: {winner.department}
                          </Typography>
                          <Chip
                            label={`${winner.votes} Votes (${winner.percentage}%)`}
                            color="success"
                            sx={{ fontWeight: 800, fontSize: '0.9rem', py: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Chart & Breakdown */}
                    <Grid item xs={12} md={7}>
                      <Box sx={{ height: 220, mb: 2 }}>
                        <Bar
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                              y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
                            }
                          }}
                        />
                      </Box>

                      {/* Candidate list */}
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Candidate</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell align="right">Votes</TableCell>
                            <TableCell align="right">Share</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {posRes.candidates.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                              <TableCell>{c.department}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>{c.votes}</TableCell>
                              <TableCell align="right">{c.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            );
          })}

          {/* Department Analytics Table */}
          <Grid item xs={12}>
            <Paper className="glass-panel" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Department Wise Voter Turnout Analytics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department Name</TableCell>
                      <TableCell align="right">Total Eligible Students</TableCell>
                      <TableCell align="right">Votes Recorded</TableCell>
                      <TableCell align="right">Turnout Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.departmentAnalytics.map((dept, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{dept.department}</TableCell>
                        <TableCell align="right">{dept.total_students}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#34D399' }}>{dept.voted}</TableCell>
                        <TableCell align="right">{dept.turnout}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
