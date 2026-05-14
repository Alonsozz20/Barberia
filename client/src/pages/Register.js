import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, TextField, Button, Typography, Container, Paper, Alert, InputAdornment, MenuItem
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'client', phone: '', address: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography component="h1" variant="h4" align="center" color="primary">
          Create Account
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Register to get started
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Full Name"
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>
            }}
          />
          <TextField
            select
            label="Role"
            variant="outlined"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="client">Client</MenuItem>
            <MenuItem value="stylist">Stylist</MenuItem>
          </TextField>
          <TextField
            label="Phone"
            variant="outlined"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Address"
            variant="outlined"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
            Create Account
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login" color="primary">Sign in</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
