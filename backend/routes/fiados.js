const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { authenticateToken } = require('../middlewares/auth');

// Obtener ventas pagadas
router.get('/fiados_pagados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fiados_pagados ORDER BY paid_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener fiados pagados:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Registrar pago total 
router.post('/fiado-pagado', async (req, res) => {
  const {
    sale_id, client, bottle_size, quantity,
    price, route, sale_date, paid_quantity, is_partial,
    original_sale_id, total_pagado // Usar total_pagado, no total_restante
  } = req.body;

  const clientDB = await pool.connect();

  try {
    await clientDB.query('BEGIN');

    // Insertar pago (total o parcial)
    await clientDB.query(
  `INSERT INTO fiados_pagados (
    sale_id, client, bottle_size, quantity,
    price, route, sale_date, paid_quantity,
    is_partial, original_sale_id, total_pagado, paid_at
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
  [sale_id, client, bottle_size, paid_quantity,  // 👈 aquí va paid_quantity como quantity
  price, route, sale_date, paid_quantity,
  is_partial, original_sale_id, total_pagado]
);


    // Si es pago total, eliminar venta original
    if (!is_partial) {
      await clientDB.query(
        'DELETE FROM delivery_fiados WHERE id = $1',
        [sale_id]
      );
    }

    await clientDB.query('COMMIT');
    res.status(200).json({ message: is_partial ? 'Pago parcial registrado' : 'Venta pagada completamente' });
  } catch (error) {
    await clientDB.query('ROLLBACK');
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error interno al guardar pago' });
  } finally {
    clientDB.release();
  }
});

/* Actualizar cantidad restante tras pago parcial (solo update)
router.put('/update-quantity/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await pool.query('UPDATE delivery_fiados SET quantity = $1 WHERE id = $2', [quantity, id]);
    res.status(200).json({ message: 'Cantidad actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la cantidad' });
  }
});*/

router.post('/fiado-parcial', async (req, res) => {
  const {
    sale_id, client, bottle_size,
    price, route, sale_date,
    paid_quantity, original_sale_id, total_pagado, deliveryman
  } = req.body;

  const is_partial = true;
  const clientDB = await pool.connect();

  try {
    await clientDB.query('BEGIN');

    // 1. Buscar el fiado original
    const result = await clientDB.query(`
      SELECT id, quantity, COALESCE(paid_quantity, 0) AS paid_quantity
      FROM delivery_fiados
      WHERE id = $1 OR original_sale_id = $1
      ORDER BY id ASC
      LIMIT 1
    `, [original_sale_id]);

    if (result.rowCount === 0) {
      throw new Error(`No se encontró delivery_fiado con id o original_sale_id ${original_sale_id}`);
    }

    const deliveryFiadoId = result.rows[0].id;
    const totalQuantity = parseFloat(result.rows[0].quantity);
    const totalPaidBefore = parseFloat(result.rows[0].paid_quantity);
    const totalPaidNow = totalPaidBefore + paid_quantity;

    // 2. Insertar el pago parcial en fiados_pagados
    await clientDB.query(`
      INSERT INTO fiados_pagados (
        sale_id, client, bottle_size, quantity,
        price, route, sale_date, paid_quantity,
        is_partial, original_sale_id, total_pagado, paid_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
    `, [
      original_sale_id, client, bottle_size, paid_quantity,
      price, route, sale_date, paid_quantity,
      is_partial, original_sale_id, total_pagado
    ]);

    if (totalPaidNow >= totalQuantity) {
      // ✅ Pago completo: eliminar el registro original
      await clientDB.query(`DELETE FROM delivery_fiados WHERE id = $1`, [deliveryFiadoId]);
    } else {
      // ✅ Pago parcial: eliminar original y crear nuevo con saldo restante

      const quantityLeft = totalQuantity - totalPaidNow;
      const totalRestante = quantityLeft * price;

      await clientDB.query(`DELETE FROM delivery_fiados WHERE id = $1`, [deliveryFiadoId]);

     await clientDB.query(`
  INSERT INTO delivery_fiados (
    client, route, bottle_size, price, deliveryman, quantity,
    original_sale_id, sale_date, paid, paid_amount, paid_quantity
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,0,0)
`, [
  client,
  route,
  bottle_size,
  price,
  deliveryman, // ✅ pásalo desde el frontend o recupéralo antes
  quantityLeft,
  original_sale_id,
  sale_date
]);


    }

    await clientDB.query('COMMIT');
    res.status(200).json({ message: 'Pago parcial registrado correctamente' });
  } catch (error) {
    await clientDB.query('ROLLBACK');
    console.error('Error al registrar pago parcial:', error);
    res.status(500).json({ message: 'Error interno al guardar pago parcial' });
  } finally {
    clientDB.release();
  }
});






module.exports = router;
