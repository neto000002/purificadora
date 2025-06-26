import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Typography, TextField, Snackbar, Alert, Grid, List, ListItem, ListItemText, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, Edit, Delete, ArrowBack } from '@mui/icons-material';  // Importar ArrowBack
import { useNavigate } from 'react-router-dom';  // Importar useNavigate

const RegisterDeliveryMan = () => {
  const navigate = useNavigate();  // Inicializar el hook para navegación
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/deliverymen/list")
      .then(response => response.json())
      .then(data => setDeliveryMen(data))
      .catch(error => console.error("Error al obtener los repartidores:", error));
  }, []);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    setEmail(newName ? `${newName.toLowerCase()}@diamante.com` : '');
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setSnackbarMessage("El teléfono debe tener 10 caracteres.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    if (!validatePassword(password)) {
      setSnackbarMessage("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const requestBody = { name, email, phone, password };

    try {
      let response;
      if (editingId) {
        response = await fetch(`http://localhost:5000/api/deliverymen/update/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      } else {
        response = await fetch("http://localhost:5000/api/deliverymen/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      }

      const data = await response.json();

      if (response.ok) {
        const successMessage = editingId ? "Repartidor actualizado con éxito" : "Repartidor registrado con éxito";
        setSnackbarMessage(successMessage);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        if (editingId) {
          setDeliveryMen(deliveryMen.map(deliveryMan =>
            deliveryMan.id === editingId ? { ...deliveryMan, ...requestBody } : deliveryMan
          ));
        } else {
          setDeliveryMen([...deliveryMen, { id: data.id, ...requestBody }]);
        }

        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setEditingId(null);
      } else {
        setSnackbarMessage(data.message || "Error al registrar o actualizar el repartidor");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setSnackbarMessage("No se pudo conectar con el servidor");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEdit = (deliveryMan) => {
    setEditingId(deliveryMan.id);
    setName(deliveryMan.name);
    setEmail(deliveryMan.email);
    setPhone(deliveryMan.phone);
    setPassword(deliveryMan.password);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deliverymen/delete/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarMessage("Repartidor eliminado con éxito");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        setDeliveryMen(deliveryMen.filter(deliveryMan => deliveryMan.id !== id));
      } else {
        setSnackbarMessage(data.message || "Error al eliminar el repartidor");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error al eliminar el repartidor:", error);
      setSnackbarMessage("No se pudo conectar con el servidor");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #d4e8f5, #c9d9e6)' }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <IconButton onClick={() => navigate("/dashboard")} color="primary">
                <ArrowBack />
              </IconButton>

              <Typography variant="h5" align="center" color="primary" gutterBottom>
                {editingId ? "Editar Repartidor" : "Registro de Repartidor"}
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField label="Nombre" fullWidth value={name} onChange={handleNameChange} required variant="outlined" sx={{ mb: 2 }} />
                <TextField label="Correo electrónico" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required variant="outlined" sx={{ mb: 2 }} />
                <TextField label="Teléfono" fullWidth value={phone} onChange={handlePhoneChange} required variant="outlined" sx={{ mb: 2 }} />
                <TextField
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
                  {editingId ? "Guardar Cambios" : "Registrar Repartidor"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="h5" align="center" color="primary" gutterBottom>
                Repartidores Registrados
              </Typography>

              {deliveryMen.length > 0 ? (
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {deliveryMen.map((deliveryMan, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={`Nombre: ${deliveryMan.name}`}
                        secondary={
                          <>
                            <Typography variant="body2">Email: {deliveryMan.email}</Typography>
                            <Typography variant="body2">Teléfono: {deliveryMan.phone}</Typography>
                            <Typography variant="body2">Contraseña: {deliveryMan.password}</Typography>
                          </>
                        }
                      />
                      <IconButton onClick={() => handleEdit(deliveryMan)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(deliveryMan.id)} color="error">
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" align="center" color="textSecondary">
                  No hay repartidores registrados.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar para mostrar los mensajes */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterDeliveryMan;
