import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Stack, Button
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { reportsAPI } from '../services/api';

export default function ReportsPage() {
  const [tab, setTab] = useState('audit');
  const [logs, setLogs] = useState([]);
  const [studentReport, setStudentReport] = useState(null);
  const [candidateReport, setCandidateReport] = useState(null);
  const [electionReport, setElectionReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [tab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (tab === 'audit') {
        const res = await reportsAPI.getAuditLogs();
        setLogs(res.data.logs);
      } else if (tab === 'students') {
        const res = await reportsAPI.getStudentReport();
        setStudentReport(res.data.report);
      } else if (tab === 'candidates') {
        const res = await reportsAPI.getCandidateReport();
        setCandidateReport(res.data.report);
      } else if (tab === 'elections') {
        const res = await reportsAPI.getElectionReport();
        setElectionReport(res.data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Reports & System Audit Trail
        </Typography>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print Report
        </Button>
      </Stack>

      <Paper className="glass-panel" sx={{ p: 3, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Audit Logs" value="audit" />
          <Tab label="Student Report" value="students" />
          <Tab label="Candidate Report" value="candidates" />
          <Tab label="Election Summary" value="elections" />
        </Tabs>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            {/* Audit Logs */}
            {tab === 'audit' && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>User Type</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip label={log.user_type} size="small" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#A78BFA' }}>{log.action}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell sx={{ color: '#94A3B8' }}>{log.ip_address || 'Localhost'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Student Report */}
            {tab === 'students' && studentReport && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Student Demographics Overview</Typography>
                <Typography variant="body1">Total Registered Students: <strong>{studentReport.totalStudents}</strong></Typography>
                <Typography variant="body1">Active Eligible Voters: <strong>{studentReport.activeStudents}</strong></Typography>
                <Typography variant="body1">Inactive Accounts: <strong>{studentReport.inactiveStudents}</strong></Typography>
              </Box>
            )}

            {/* Candidate Report */}
            {tab === 'candidates' && candidateReport && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Candidate Summary</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>Total Nominated Candidates: <strong>{candidateReport.totalCandidates}</strong></Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Election Title</TableCell>
                        <TableCell align="right">Candidates Nominated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {candidateReport.perElection.map((e, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 600 }}>{e.election}</TableCell>
                          <TableCell align="right">{e.candidates}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Election Summary */}
            {tab === 'elections' && electionReport && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Election Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Votes Recorded</TableCell>
                      <TableCell align="right">Voter Turnout</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {electionReport.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{e.title}</TableCell>
                        <TableCell><Chip label={e.status} size="small" /></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#34D399' }}>{e.voted}</TableCell>
                        <TableCell align="right">{e.turnout}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
