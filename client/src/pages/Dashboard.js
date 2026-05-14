import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Paper,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, IconButton, CircularProgress
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/appointments/myappointments');
      setAppointments(res.data);
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusChip = (status) => {
    const config = {
      pending: { color: 'warning', icon: <ScheduleIcon fontSize="small" />, label: 'Pending' },
      confirmed: { color: 'info', icon: <CheckCircleIcon fontSize="small" />, label: 'Confirmed' },
      completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
      cancelled: { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' },
      'no-show': { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'No Show' },
    };
    const c = config[status] || config.pending;
    return <Chip icon={c.icon} label={c.label} color={c.color} size="small" />;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const upcomingAppointments = appointments.filter(a =>
    ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date()
  );
  const pastAppointments = appointments.filter(a =>
    ['completed', 'cancelled', 'no-show'].includes(a.status) || new Date(a.date) < new Date()
  );

  const displayAppointments = tab === 0 ? upcomingAppointments : pastAppointments;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{
        bgcolor: '#263238', color: 'white', px: 3, py: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon />
          <Typography variant="h6">Dashboard</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" onClick={() => navigate('/')} title="Home">
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" color="white">{user?.name?.[0]?.toUpperCase()}</Typography>
          </Box>
          <Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === 'admin' ? 'Admin' : user?.role === 'stylist' ? 'Stylist' : 'Client'}
              {user?.email && ' - ' + user.email}
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main">{upcomingAppointments.length}</Typography>
                <Typography variant="body2" color="text.secondary">Upcoming</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">{appointments.filter(a => a.status === 'completed').length}</Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main">{appointments.filter(a => a.status === 'pending').length}</Typography>
                <Typography variant="body2" color="text.secondary">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="secondary.main">${appointments.reduce((sum, a) => sum + (a.price || 0), 0)}</Typography>
                <Typography variant="body2" color="text.secondary">Total</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/')}>
            New Booking
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)}>
              <Tab label={'Upcoming (' + upcomingAppointments.length + ')'} />
              <Tab label={'History (' + pastAppointments.length + ')'} />
            </Tabs>
          </Box>

          {displayAppointments.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No {tab === 0 ? 'upcoming' : 'past'} appointments</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Stylist</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayAppointments.map(apt => (
                    <TableRow key={apt._id} hover>
                      <TableCell>{formatDate(apt.date)}</TableCell>
                      <TableCell>{apt.service?.name || 'N/A'}</TableCell>
                      <TableCell>{apt.stylist?.name || 'N/A'}</TableCell>
                      <TableCell>{apt.startTime} - {apt.endTime}</TableCell>
                      <TableCell>{getStatusChip(apt.status)}</TableCell>
                      <TableCell>${apt.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
