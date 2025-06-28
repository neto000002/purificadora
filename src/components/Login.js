import React, { useState } from 'react';
import { Card, CardContent, Button, Typography, TextField, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
    console.log("API URL:", process.env.REACT_APP_API_URL);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });


      const data = await response.json();

      if (response.ok) {
        console.log('Login exitoso:', data);
        setSnackbarMessage('Login exitoso');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Guardamos el token y el rol en el localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);  // Guardar el rol
        localStorage.setItem('repartidor', data.name);  // Guardar el nombre del repartidor

        // Redirigir según el rol
        if (data.role === 'admin') {
          navigate('/dashboard');  // Redirigir al panel del administrador
        } else if (data.role === 'repartidor') {
          navigate('/delivery-panel');  // Redirigir al panel del repartidor
        }
      } else {
        setSnackbarMessage(data.message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setSnackbarMessage('Error al conectar con el servidor');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #d4e8f5, #c9d9e6)',
        position: 'relative',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            Purificadora Diamante
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            Inicia sesión para acceder al sistema
          </Typography>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.dark',
                    },
                  },
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.dark',
                    },
                  },
                }}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
