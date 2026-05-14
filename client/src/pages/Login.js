import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, TextField, Button, Typography, Container, Paper, Alert, InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography component="h1" variant="h4" align="center" color="primary">
          Salon App
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Sign in to your account
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>
            }}
          />
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
            Sign In
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account? <Link to="/register" color="primary">Register</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
