import React from 'react';
import { Button, Grid, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const DashboardPanel = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Lógica de logout, limpiar sesión, tokens, etc.
window.location.href = 'http://localhost:3000/';
  };

  // Lista de botones excepto logout
  const buttons = [
    { path: '/register-deliveryman', label: 'Registrar Repartidor' },
    { path: '/sales', label: 'Ventas' },
    { path: '/fiados', label: 'Fiados' },
    { path: '/expenses', label: 'Reportes' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url('/images/logoPuri.jpg')`,
        backgroundSize: 'contain',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Sección izquierda para los botones */}
      <div
        style={{
          width: '30%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '5%',
        }}
      >
        <h2
          style={{
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            marginBottom: '15px',
          }}
        >
          Panel de Administración
        </h2>

        <Grid container spacing={2} justifyContent="flex-start">
          {buttons.map((item, index) => (
            <Grid
              item
              xs={6}
              key={index}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Button
                onClick={() => navigate(item.path)}
                variant="contained"
                style={{
                  width: '150px',
                  maxWidth: '300px',
                  height: '150px',
                  borderRadius: '20px',
                  color: 'white',
                  textTransform: 'none',
                  boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#007bff',
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}

          {/* Botón cerrar sesión debajo de Reportes */}
          <Grid
            item
            xs={6}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Tooltip title="Cerrar sesión">
              <IconButton
                onClick={handleLogout}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '20px',
                  color: 'white',
                  backgroundColor: '#dc3545',
                  boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
                }}
              >
                <LogoutIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Botón Inventario debajo de cerrar sesión */}
          <Grid
            item
            xs={6}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <Button
              onClick={() => navigate('/inventory')}
              variant="contained"
              style={{
                width: '150px',
                maxWidth: '300px',
                height: '150px',
                borderRadius: '20px',
                color: 'white',
                textTransform: 'none',
                boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: '#007bff',
              }}
            >
              Inventario
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default DashboardPanel;
