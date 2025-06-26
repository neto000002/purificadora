// routes/salesReports.js (o donde manejes tus rutas)
const express = require('express');
const router = express.Router();
const { pool } = require('../db');// Asegúrate de tener configurado PostgreSQL


router.post('/save-report', async (req, res) => {
  const { reportData } = req.body;
  const generatedAt = new Date(); // Fecha actual

  try {
    await pool.query('INSERT INTO sales_reports (report_data, generated_at) VALUES ($1, $2)', [reportData, generatedAt]);
    res.status(200).json({ message: 'Reporte guardado en la base de datos' });
  } catch (error) {
    console.error('Error al guardar el reporte:', error);
    res.status(500).json({ message: 'Error al guardar el reporte' });
  }
});


router.get('/get-reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, report_data, generated_at FROM sales_reports ORDER BY generated_at DESC');
    console.log(result.rows); // Verifica qué contiene result.rows
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los reportes:', error);
    res.status(500).json({ message: 'Error al obtener los reportes' });
  }
});


module.exports = router;
