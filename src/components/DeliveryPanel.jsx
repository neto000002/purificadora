import React from 'react';
import { Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DeliveryPanel = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // o como guardes el token
    navigate('/');
  };

  const buttons = [
    { path: '/register-client', label: 'Registrar Cliente' },
    { path: '/delivery-sales', label: 'Ventas' },
    { path: '/delivery-fiados', label: 'Fiados' },
    { path: '/delivery-expenses', label: 'Gastos' },
    { path: '/delivery-reports', label: 'Reportes' },
    { path: '/delivery-inventory', label: 'Inventario' },
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
      {/* Panel izquierdo con botones */}
      <div
        style={{
          width: '30%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // 👈 Esto distribuye espacio: botones arriba, logout abajo
          padding: '5% 0 5% 5%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2
            style={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              marginBottom: '15px',
            }}
          >
            Panel de Repartidores
          </h2>

          <Grid container spacing={2} justifyContent="flex-start">
            {buttons.map((item, index) => (
              <Grid item xs={6} key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  onClick={() => navigate(item.path)}
                  variant="contained"
                  style={{
                    width: '150px',
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
          </Grid>
        </div>

        {/* Botón cerrar sesión */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={handleLogout}
            variant="contained"
            style={{
              marginTop: '30px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '20px',
              padding: '10px 20px',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPanel;
