import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AppointmentForm = () => {
  const { stylistId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    stylistId: stylistId || '',
    serviceId: serviceId || '',
    date: '',
    startTime: '',
    notes: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stylistsRes, servicesRes] = await Promise.all([
        axios.get('/api/users/stylists'),
        axios.get('/api/services')
      ]);
      setStylists(stylistsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axios.post('/api/appointments', {
        stylistId: form.stylistId,
        serviceId: form.serviceId,
        date: form.date,
        startTime: form.startTime,
        notes: form.notes
      });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h5">New Appointment</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Stylist</InputLabel>
            <Select
              name="stylistId"
              value={form.stylistId}
              onChange={handleChange}
              required
              label="Stylist"
            >
              {stylists.map(s => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Service</InputLabel>
            <Select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              required
              label="Service"
            >
              {services.map(s => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name} - ${s.price} ({s.duration} min)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Start Time"
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Notes (optional)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AppointmentForm;
