const express = require("express");
const router = express.Router();
const { pool } = require("../server");

// 📌 Ruta para registrar un cliente
router.post("/register", async (req, res) => {
  const { name, route } = req.body;

  if (!name || !route) {
    return res.status(400).json({ message: "Nombre y ruta son requeridos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO clients (name, route) VALUES ($1, $2) RETURNING *",
      [name, route]
    );

    res.status(201).json({
      message: "Cliente registrado exitosamente",
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar el cliente:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 📌 Ruta para obtener clientes por ruta
router.get("/by-route/:route", async (req, res) => {
  const { route } = req.params;

  try {
    const result = await pool.query("SELECT * FROM clients WHERE route = $1", [route]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 📌 Ruta para editar un cliente
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, route } = req.body;

  if (!name || !route) {
    return res.status(400).json({ message: "Nombre y ruta son requeridos" });
  }

  try {
    const result = await pool.query(
      "UPDATE clients SET name = $1, route = $2 WHERE id = $3 RETURNING *",
      [name, route, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.status(200).json({
      message: "Cliente actualizado exitosamente",
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 📌 Ruta para eliminar un cliente
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.status(200).json({
      message: "Cliente eliminado exitosamente",
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
