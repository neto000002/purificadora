// src/components/SalesAccounts.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import SalesList from './SalesList';

const SalesAccounts = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Cuentas de Ventas</h2>
      <p>Lista de cuentas de ventas y detalles.</p>

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

      {/* Puro modo vista para admin */}
      <SalesList modoAdmin={true} />
    </div>
  );
};

export default SalesAccounts;
