const express = require("express");
const router = express.Router();
const { pool } = require("../server");

// Obtener todo el inventario
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    res.status(500).json({ message: "Error al obtener el inventario" });
  }
});

// Actualizar cantidad de un producto
router.put("/:name", async (req, res) => {
  const { name } = req.params;
  const { quantity } = req.body;

  try {
    const result = await pool.query(
      "UPDATE inventory SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2 RETURNING *",
      [quantity, name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar el inventario:", error);
    res.status(500).json({ message: "Error al actualizar el inventario" });
  }
});

module.exports = router;
