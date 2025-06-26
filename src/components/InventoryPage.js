// src/components/InventoryPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryInventory from './DeliveryInventory'; // Este es el verdadero componente de inventario

const InventoryPage = () => {
  const navigate = useNavigate();
  return (
    <div>
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
      <DeliveryInventory />
    </div>
  );
};

export default InventoryPage;
