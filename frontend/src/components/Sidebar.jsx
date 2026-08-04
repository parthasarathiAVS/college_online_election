import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Stack, Button
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import ConnectedTvIcon from '@mui/icons-material/ConnectedTv';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PollIcon from '@mui/icons-material/Poll';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BallotIcon from '@mui/icons-material/Ballot';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Students', icon: <PeopleIcon />, path: '/dashboard/students' },
  { text: 'Candidates', icon: <HowToVoteIcon />, path: '/dashboard/candidates' },
  { text: 'Departments', icon: <BusinessIcon />, path: '/dashboard/departments' },
  { text: 'Positions', icon: <BadgeIcon />, path: '/dashboard/positions' },
  { text: 'Election', icon: <BallotIcon />, path: '/dashboard/elections' },
  { text: 'Voting Booth', icon: <ConnectedTvIcon />, path: '/dashboard/booth' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/dashboard/reports' },
  { text: 'Results', icon: <PollIcon />, path: '/dashboard/results' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'rgba(11, 15, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)'
        }
      }}
    >
      {/* Header / College Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user?.logo_url ? `http://localhost:5000${user.logo_url}` : undefined}
          sx={{
            width: 44,
            height: 44,
            bgcolor: '#7C3AED',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
          }}
        >
          {user?.name ? user.name.charAt(0) : 'V'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'College Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#A78BFA', fontSize: '0.75rem' }}>
            VoteVerse Kiosk Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)', my: 1 }} />

      {/* Menu List */}
      <List sx={{ px: 1.5, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  px: 2,
                  backgroundColor: isActive ? 'rgba(124, 58, 237, 0.18)' : 'transparent',
                  color: isActive ? '#A78BFA' : '#94A3B8',
                  borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    color: '#F1F5F9'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#A78BFA' : '#64748B', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Logout button at bottom */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            py: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            '&:hover': {
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}
