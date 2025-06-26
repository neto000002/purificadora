import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Typography, Grid, Card, CardContent, Snackbar, Alert, IconButton } from '@mui/material';
import { ArrowBack, LocalDrink, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const routes = [
  { name: 'Lunes y Viernes', streets: ['Niño Artillero', '5 de Febrero', 'Úrsulo Galván', 'Miguel Hidalgo', 'Insurgentes', 'Emiliano Zapata', 'Campo', 'Adolfo López Mateos'] },
  { name: 'Martes', streets: ['Reforma', 'Niños Héroes', 'Constitución', 'Adolfo López Mateos', 'Campo'] },
  { name: 'Miércoles y Sábado', streets: ['Niños Héroes', 'Calzada de Guadalupe', 'Galiana', 'Veracruz'] },
  { name: 'Jueves', streets: ['La Toma'] }
];

const DeliverySales = () => {
  const navigate = useNavigate();
  const [route, setRoute] = useState('');
  const [client, setClient] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bottleSize, setBottleSize] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [price, setPrice] = useState(null);
  const [repartidor, setRepartidor] = useState('');
  const [repartidores, setRepartidores] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch repartidores
  useEffect(() => {
    const fetchRepartidores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deliverymen/list');
        const data = await response.json();
        setRepartidores(data);
      } catch (error) {
        console.error('Error fetching repartidores:', error);
      }
    };
    fetchRepartidores();
  }, []);

  // Fetch clients based on the selected route
  useEffect(() => {
    if (route) {
      const fetchClients = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/clients/by-route/${route}`);
          const data = await response.json();
          setClients(data);
          setFilteredClients(data);
        } catch (error) {
          console.error('Error fetching clients:', error);
        }
      };
      fetchClients();
    } else {
      setClients([]);
      setFilteredClients([]);
    }
  }, [route]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos antes de enviar:", { client, route, bottleSize, price, repartidor, quantity });
    if (!client || !bottleSize || !price || !repartidor || !quantity) {
      setSnackbarMessage('Por favor completa todos los campos.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Crear un objeto con los datos de la venta
    const saleData = {
      client,
      route,
      bottleSize,
      price,
      deliveryman: repartidor,
      quantity,
    };

    console.log("Datos antes de enviar:", saleData); 

    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarMessage('Venta registrada con éxito');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Limpiar los campos del formulario
        setClient('');
        setBottleSize(null);
        setPrice(null);
        setRepartidor('');
        setQuantity(1);
      } else {
        setSnackbarMessage(data.message || 'Error al registrar la venta.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('Error al conectar con el servidor.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error('Error al registrar la venta:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #d4e8f5, #c9d9e6)' }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <IconButton onClick={() => navigate("/delivery-panel")} color="primary">
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" align="center" color="primary" gutterBottom>
                Registrar Venta
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  select
                  label="Seleccionar Ruta"
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

                <TextField
                  label="Buscar Cliente"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setSearchQuery('')}>
                        <Search />
                      </IconButton>
                    )
                  }}
                />
                <TextField
                  select
                  label="Seleccionar Cliente"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  disabled={!route || !filteredClients.length}
                >
                  {filteredClients.map((c) => (
                    <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </TextField>

                {/* Selector de Repartidor */}
                <TextField
                  select
                  label="Seleccionar Repartidor"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                  value={repartidor}
                  onChange={(e) => setRepartidor(e.target.value)}
                  disabled={repartidores.length === 0} // Desactivar si no hay repartidores
                >
                  {repartidores.length > 0 ? (
                    repartidores.map((r) => (
                      <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">Cargando repartidores...</MenuItem>
                  )}
                </TextField>

                {/* Botones para seleccionar tamaño de botella */}
                <Grid container spacing={2} justifyContent="center">
                  {[20, 10, 5].map((size) => (
                    <Grid item key={size}>
                      <Button
                        variant={bottleSize === size ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => {
                          setBottleSize(size);
                          setShowSelect(true); // Mostrar el selector cuando se selecciona un tamaño
                        }}
                        startIcon={<LocalDrink />}
                      >
                        {size}L
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                {/* Selector de cantidad */}
                {showSelect && bottleSize && (
                  <TextField
                  select
                  label="Seleccionar Cantidad"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))} // Convertir a número
                >
                  {[1, 2, 3, 4, 5].map((q) => (
                    <MenuItem key={q} value={q}>
                      {q}
                    </MenuItem>
                  ))}
                </TextField>                
                )}

                {/* Botones de precios */}
                <Grid container spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                  {[25, 15, 14, 12, 10].map((p) => (
                    <Grid item key={p}>
                      <Button
                        variant={price === p ? "contained" : "outlined"}
                        color="secondary"
                        onClick={() => setPrice(p)}
                      >
                        ${p}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Guardar Venta
                </Button>
              </form>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate("/sales-list")}
              >
                Ver Lista de Ventas
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DeliverySales;
