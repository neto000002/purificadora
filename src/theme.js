// src/theme.js

import { createTheme } from '@mui/material/styles';

// Definir el tema con tus colores personalizados
const theme = createTheme({
  palette: {
    primary: {
      main: '#0066cc',  // Azul principal
    },
    secondary: {
      main: '#28a745',  // Verde secundario
    },
    background: {
      default: '#f0f4f8',  // Fondo claro
    },
    text: {
      primary: '#333',  // Texto oscuro para contraste
      secondary: '#555', // Texto gris para secundario
    },
  },
});

export default theme;
