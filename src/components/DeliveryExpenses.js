import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Paper, Snackbar, Alert } from '@mui/material';

const DeliveryExpenses = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/expenses/gastos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el gasto');
      }

      setSnackbarMessage('Gasto registrado correctamente');
      setSnackbarSeverity('success');
      setDescription('');
      setAmount('');
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
    }

    setSnackbarOpen(true);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
        <Typography variant="h5" gutterBottom>
          Registrar Gasto
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Descripción"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Monto"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Guardar Gasto
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeliveryExpenses;
