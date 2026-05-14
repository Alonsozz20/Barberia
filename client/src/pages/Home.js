import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box, Grid, Card, CardContent, CardActions, Button, Typography,
  Chip, TextField, Select, MenuItem, FormControl, InputLabel, Skeleton,
  Avatar, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Divider, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'barberia', label: 'Barberia' },
  { value: 'manicura', label: 'Manicura' },
  { value: 'pintado', label: 'Pintado' },
  { value: 'lizado', label: 'Lizado' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'otro', label: 'Otro' },
];

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stylists, setStylists] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    fetchStylists();
  }, [category]);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services' + (category ? '?category=' + category : ''));
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStylists = async () => {
    try {
      const res = await axios.get('/api/users/stylists');
      setStylists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCategoryColor = (cat) => {
    const colors = {
      barberia: '#e91e63',
      manicura: '#9c27b0',
      pintado: '#2196f3',
      lizado: '#4caf50',
      tratamiento: '#ff9800',
      otro: '#607d8b'
    };
    return colors[cat] || '#607d8b';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Salon App
          </Typography>
          <List>
            <ListItem button onClick={() => { navigate('/'); setDrawerOpen(false); }}>
              <ListItemIcon><ScheduleIcon /></ListItemIcon>
              <ListItemText primary="Services" />
            </ListItem>
            {user && (
              <ListItem button onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
            )}
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box sx={{
        width: 250, minHeight: '100vh', bgcolor: '#263238',
        display: { xs: 'none', md: 'block' }, p: 2
      }}>
        <Typography variant="h5" sx={{ color: 'white', mb: 4, fontWeight: 700 }}>
          Salon App
        </Typography>
        <List>
          <ListItem button onClick={() => navigate('/')} sx={{ '&:hover': { bgcolor: '#37474f' } }}>
            <ListItemIcon sx={{ color: 'white' }}><ScheduleIcon /></ListItemIcon>
            <ListItemText primary="Services" />
          </ListItem>
          {user && (
            <ListItem button onClick={() => navigate('/dashboard')} sx={{ '&:hover': { bgcolor: '#37474f' } }}>
              <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          )}
          <ListItem button onClick={handleLogout} sx={{ '&:hover': { bgcolor: '#37474f' } }}>
            <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>

        {user && (
          <Box sx={{ mt: 4, p: 2, bgcolor: '#37474f', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ color: 'white' }}>{user.name}</Typography>
                <Typography variant="caption" sx={{ color: 'grey.400' }}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'stylist' ? 'Stylist' : 'Client'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Our Services
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose the service you need
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>

        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
            {categories.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" height={80} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : services.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              No services available
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {services.map(service => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" color="primary.main">{service.name}</Typography>
                      <Chip label={service.category} size="small" sx={{ bgcolor: getCategoryColor(service.category), color: 'white' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="body2">{service.duration} min</Typography>
                      </Box>
                      <Typography variant="h6" color="secondary.main" fontWeight={700}>
                        ${service.price}
                      </Typography>
                    </Box>
                    {service.stylists && service.stylists.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Stylists: {service.stylists.map(s => s.name).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    {user ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/book/' + service.stylists?.[0] + '?serviceId=' + service._id)}
                      >
                        Book
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/login')}
                      >
                        Sign in to book
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Home;
