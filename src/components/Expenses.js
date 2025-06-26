// src/components/Expenses.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryReports from './DeliveryReports'; // importa la vista de reportes

const Expenses = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* Botón para ir a /dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
        }}
      >
        Regresar al panel
      </button>
      {/* Aquí mostramos la vista de reportes */}
      <DeliveryReports />
    </div>
  );
};

export default Expenses;
