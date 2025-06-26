const express = require('express');
const router = express.Router();
const { pool } = require('../db');  // Asegúrate de importar correctamente el objeto 'pool'

router.post('/gastos', async (req, res) => {
  const { description, amount } = req.body;
  try {
    await pool.query(  // Aquí 'pool.query' debería funcionar
      'INSERT INTO expenses (description, amount) VALUES ($1, $2)',
      [description, amount]
    );
    res.status(201).json({ message: 'Gasto registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar gasto:', error);
    res.status(500).json({ message: 'Error al registrar gasto' });
  }
});

// Agrega este código en tu archivo del backend, después de la ruta POST
router.get('/gastos', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM expenses');
      res.status(200).json(result.rows);  // Devuelve los resultados como JSON
    } catch (error) {
      console.error('Error al obtener los gastos:', error);
      res.status(500).json({ message: 'Error al obtener los gastos' });
    }
  });

  router.delete('/delete-all', async (req, res) => {
    try {
      await pool.query('DELETE FROM expenses');
      res.status(200).json({ message: 'Gastos eliminados' });
    } catch (error) {
      console.error('Error al eliminar los gastos:', error);
      res.status(500).json({ message: 'Error al eliminar los gastos', error });
    }
  });
  

  
  
  

module.exports = router;
