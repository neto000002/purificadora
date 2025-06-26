import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Typography, Grid, Card, CardContent, Snackbar, Alert, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material'; // Asegúrate de importar ArrowBack
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar useNavigate

const routes = [
  { name: 'Lunes y Viernes', streets: ['Niño Artillero', '5 de Febrero', 'Úrsulo Galván', 'Miguel Hidalgo', 'Insurgentes', 'Emiliano Zapata', 'Campo', 'Adolfo López Mateos'] },
  { name: 'Martes', streets: ['Reforma', 'Niños Héroes', 'Constitución', 'Adolfo López Mateos', 'Campo'] },
  { name: 'Miercoles y Sabado', streets: ['Niños Héroes', 'Calzada de Guadalupe', 'Galiana', 'Veracruz'] },
  { name: 'Jueves', streets: ['La Toma'] }
];

const RegisterClient = () => {
  const navigate = useNavigate();  // Inicializamos el hook para la navegación
  const [name, setName] = useState('');
  const [route, setRoute] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [clients, setClients] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    if (selectedRoute) {
      const fetchClientsByRoute = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/clients/by-route/${selectedRoute}`);
          const data = await response.json();
          setClients(data);
        } catch (error) {
          console.error('Error fetching clients by route:', error);
        }
      };
      fetchClientsByRoute();
    } else {
      setClients([]);
    }
  }, [selectedRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const clientData = { name, route };
    let response;

    if (editingClient) {
      // Si estamos editando, hacemos un PUT para actualizar el cliente
      response = await fetch(`http://localhost:5000/api/clients/edit/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
    } else {
      // Si estamos registrando, hacemos un POST
      response = await fetch('http://localhost:5000/api/clients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
    }

    if (response.ok) {
      const updatedClient = await response.json();
      const message = editingClient ? 'Cliente actualizado con éxito' : 'Cliente registrado con éxito';
      setSnackbarMessage(message);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setName('');
      setRoute('');
      setEditingClient(null);
      setClients(prevClients => editingClient ? prevClients.map(client => client.id === updatedClient.client.id ? updatedClient.client : client) : [...prevClients, updatedClient.client]);
    } else {
      setSnackbarMessage('Error al guardar cliente');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleEdit = (clientId) => {
    const clientToEdit = clients.find(client => client.id === clientId);
    setName(clientToEdit.name);
    setRoute(clientToEdit.route);
    setEditingClient(clientToEdit); // Guardamos el cliente que estamos editando
  };

  const handleDelete = async (clientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/clients/delete/${clientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbarMessage('Cliente eliminado con éxito');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setClients(clients.filter(client => client.id !== clientId));
      } else {
        setSnackbarMessage('Error al eliminar cliente');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setSnackbarMessage('Error al conectar con el servidor');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #d4e8f5, #c9d9e6)' }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <IconButton onClick={() => navigate("/delivery-panel")} color="primary">  {/* Agregado IconButton */}
                <ArrowBack />
              </IconButton>

              <Typography variant="h5" align="center" color="primary" gutterBottom>
                {editingClient ? 'Editar Cliente' : 'Registrar Cliente'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Nombre del Cliente"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  select
                  label="Ruta"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                >
                  {routes.map((r) => (
                    <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>
                  ))}
                </TextField>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  {editingClient ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="h5" align="center" color="primary" gutterBottom>
                Clientes Registrados
              </Typography>
              <TextField
                select
                label="Seleccionar Ruta"
                variant="outlined"
                fullWidth
                margin="normal"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
              >
                {routes.map((r) => (
                  <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>
                ))}
              </TextField>
              <List>
                {clients.map((client) => (
                  <ListItem key={client.id}>
                    <ListItemText primary={`${client.name}`} />
                    <IconButton onClick={() => handleEdit(client.id)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(client.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
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

export default RegisterClient;
