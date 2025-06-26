import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente de protección de ruta
const ProtectedRoute = ({ children, roleRequired }) => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/" />;
  }

  // Si el rol no es el requerido, redirige al login o a otra página
  if (role !== roleRequired) {
    return <Navigate to="/" />;
  }

  // Si todo es correcto, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;
