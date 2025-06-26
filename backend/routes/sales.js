const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { authenticateToken } = require('../middlewares/auth');


// Ruta para registrar una venta
router.post("/", async (req, res) => {
  const { client, route, bottleSize, price, deliveryman, quantity } = req.body;

  // Validar que todos los campos sean requeridos
  if (!client || !route || !bottleSize || !price || !deliveryman || !quantity) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    // La consulta debe incluir todos los campos, incluyendo quantity
    const result = await pool.query(
    "INSERT INTO sales (client, route, bottle_size, price, deliveryman, quantity, fiado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
      [client, route, bottleSize, price, deliveryman, quantity]  // Asegúrate de que 'quantity' esté aquí
    );

    // Si la venta se registra correctamente, responde con éxito
    res.status(201).json({ message: "Venta registrada con éxito", sale: result.rows[0] });
  } catch (error) {
    console.error("Error al registrar la venta:", error);
    // Si hay un error, responde con el mensaje de error
    res.status(500).json({ message: "Error al registrar la venta" });
  }
});



// Ruta para actualizar el repartidor de una venta
router.put('/update-deliveryman/:id', async (req, res) => {
  const { id } = req.params;
  const { deliveryman } = req.body;

  if (!deliveryman) {
    return res.status(400).json({ message: "El repartidor es requerido" });
  }

  try {
    const result = await pool.query(
      "UPDATE sales SET deliveryman = $1 WHERE id = $2 RETURNING *",
      [deliveryman, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Repartidor actualizado con éxito", sale: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar el repartidor:", error);
    res.status(500).json({ message: "Error al actualizar el repartidor" });
  }
});

// Ruta para marcar una venta como vendida
router.put('/mark-sold/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE sales SET fiado = false WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Venta marcada como exitosa", sale: result.rows[0] });
  } catch (error) {
    console.error("Error al marcar la venta como exitosa:", error);
    res.status(500).json({ message: "Error al marcar la venta como exitosa" });
  }
});

// Ruta para marcar una venta como vendida
router.put('/mark-sold/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE sales SET sold = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Venta marcada como vendida", sale: result.rows[0] });
  } catch (error) {
    console.error("Error al marcar la venta como vendida:", error);
    res.status(500).json({ message: "Error al marcar la venta como vendida" });
  }
});

// Obtener todas las ventas fiadas
router.get('/fiados', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, client, route, bottle_size, price, deliveryman, sale_date FROM sales WHERE fiado = true"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las ventas fiadas:", error);
    res.status(500).json({ message: "Error al obtener las ventas fiadas" });
  }
});

// Marcar una venta como fiada
router.put('/mark-fiado/:saleId', async (req, res) => {
  const { saleId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE sales SET fiado = true WHERE id = $1 RETURNING *", [saleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Venta marcada como fiada", sale: result.rows[0] });
  } catch (error) {
    console.error("Error al marcar la venta como fiada:", error);
    res.status(500).json({ message: "Error al marcar la venta como fiada" });
  }
});

// Desmarcar una venta como fiada
router.put('/unmark-fiado/:saleId', async (req, res) => {
  const { saleId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE sales SET fiado = false WHERE id = $1 RETURNING *", [saleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Venta desmarcada como fiada", sale: result.rows[0] });
  } catch (error) {
    console.error("Error al desmarcar la venta como fiada:", error);
    res.status(500).json({ message: "Error al desmarcar la venta como fiada" });
  }
});

/*Borrar solo los no fiados
router.delete('/delete-non-fiados', async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM sales WHERE fiado = 'f'");
    console.log(`Ventas no fiadas eliminadas: ${result.rowCount}`);
    res.status(200).json({ message: 'Ventas no fiadas eliminadas exitosamente' });
  } catch (error) {
    console.error('Error al eliminar las ventas no fiadas:', error);
    res.status(500).json({ message: 'Error al eliminar las ventas no fiadas', error });
  }
});*/

router.get('/delivery-fiados', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM delivery_fiados ORDER BY sale_date DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener delivery_fiados:", error);
    res.status(500).json({ message: "Error al obtener delivery_fiados" });
  }
});


router.delete('/delete-all', async (req, res) => {
  try {
    await pool.query('DELETE FROM sales'); // Esta es la forma correcta con pg
    res.status(200).json({ message: 'Ventas eliminadas exitosamente' });
  } catch (error) {
    console.error('Error al eliminar las ventas:', error);
    res.status(500).json({ message: 'Error al eliminar las ventas', error });
  }
});

router.post('/mover-fiados', async (req, res) => {
  try {
    const { saleId } = req.body;

    // 1. Verifica que la venta exista y esté marcada como fiado
    const fiado = await pool.query("SELECT * FROM sales WHERE id = $1 AND fiado = true", [saleId]);

    if (fiado.rows.length === 0) {
      return res.status(404).json({ message: 'Fiado no encontrado o ya no está marcado como fiado' });
    }

    // 2. Intenta insertar en delivery_fiados
    await pool.query(`
      INSERT INTO delivery_fiados 
      (client, route, bottle_size, price, deliveryman, quantity, original_sale_id, sale_date, paid_quantity) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)`,
      [
        fiado.rows[0].client,
        fiado.rows[0].route,
        fiado.rows[0].bottle_size,
        fiado.rows[0].price,
        fiado.rows[0].deliveryman,
        fiado.rows[0].quantity,
        fiado.rows[0].id,
        fiado.rows[0].sale_date,
        fiado.rows[0].paid_quantity ?? 0 
      ]
    );

    res.status(200).json({ message: 'Fiado guardado en delivery_fiados correctamente' });

  } catch (error) {
    // Manejo específico de error por duplicado (violación de restricción única)
    if (error.code === '23505') { // Código de error de Postgres para "unique_violation"
      return res.status(409).json({ message: 'El fiado ya fue movido a delivery_fiados anteriormente.' });
    }

    console.error('Error al mover fiado:', error);
    res.status(500).json({ message: 'Error al mover fiado', error });
  }
});

/*router.post('/fiado-pagado', authenticateToken, async (req, res) => {
  let {
    sale_id, client, bottle_size, quantity,
    price, route, sale_date, paid_quantity, is_partial,
    original_sale_id  // <--- Agrega esto
  } = req.body;

  // Redondear cantidades a enteros para evitar error de tipo en PostgreSQL
  quantity = Math.floor(quantity);
  paid_quantity = Math.floor(paid_quantity);

  try {
    await pool.query(
      `INSERT INTO fiados_pagados (
        sale_id, client, bottle_size, quantity,
        price, route, sale_date, paid_quantity, is_partial, original_sale_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [sale_id, client, bottle_size, quantity, price, route, sale_date, paid_quantity, is_partial, original_sale_id]
    );

    // Opcional: eliminar de tabla original si deseas "mover" la venta
    await pool.query(`DELETE FROM sales WHERE id = $1`, [sale_id]);

    res.status(200).json({ message: 'Venta movida a fiados_pagados con éxito' });
  } catch (error) {
    console.error('Error al mover venta a fiados_pagados:', error);
    res.status(500).json({ message: 'Error interno al guardar fiado pagado' });
  }
});

// DELETE en delivery_fiados por id
router.delete('/delivery-fiados/original-sale/:originalSaleId', async (req, res) => {
  const { originalSaleId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM delivery_fiados WHERE original_sale_id = $1',
      [originalSaleId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Venta no encontrada en delivery_fiados con ese original_sale_id' });
    }
    res.status(200).json({ message: 'Venta eliminada de delivery_fiados' });
  } catch (error) {
    console.error('Error eliminando venta de delivery_fiados:', error);
    res.status(500).json({ message: 'Error al eliminar venta' });
  }
});*/


// Obtener todas las ventas
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las ventas:", error);
    res.status(500).json({ message: "Error al obtener las ventas" });
  }
});

router.put('/mark-partial-paid/:id', async (req, res) => {
  const { id } = req.params;
  const { paidQuantity } = req.body;

  if (paidQuantity == null || isNaN(paidQuantity) || paidQuantity < 0) {
    return res.status(400).json({ message: "Cantidad pagada inválida" });
  }

  try {
    // Consulta la venta original
    const saleResult = await pool.query(
      "SELECT quantity, paid_quantity FROM sales WHERE id = $1",
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    const sale = saleResult.rows[0];

    if (paidQuantity > sale.quantity) {
      return res.status(400).json({ message: "La cantidad pagada no puede exceder la cantidad vendida" });
    }

    // Actualizar solo la columna paid_quantity
    const updateResult = await pool.query(
      `UPDATE sales
       SET paid_quantity = $1
       WHERE id = $2
       RETURNING *`,
      [paidQuantity, id]
    );

    res.status(200).json({ message: "Venta actualizada con pago parcial", sale: updateResult.rows[0] });
  } catch (error) {
    console.error("Error en mark-partial-paid:", error);
    res.status(500).json({ message: "Error al marcar como parcialmente pagada" });
  }
});






module.exports = router;
