// routes/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu conexión a PostgreSQL

router.post('/save-report', async (req, res) => {
  const { pdfBase64, filename } = req.body;

  if (!pdfBase64 || !filename) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    await pool.query(
      'INSERT INTO reports (filename, report_pdf) VALUES ($1, $2)',
      [filename, pdfBuffer]
    );
    res.status(200).json({ message: 'Reporte guardado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar el reporte en la base de datos' });
  }
});

module.exports = router;
