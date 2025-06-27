const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();
const { pool } = require("../db");  // Conexión a PostgreSQL

// 🔹 Registrar un nuevo repartidor
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validar que no exista otro repartidor con el mismo correo
    const result = await pool.query('SELECT * FROM deliverymen WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Cifrar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo repartidor
    const insertResult = await pool.query(
      'INSERT INTO deliverymen (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, phone, hashedPassword]
    );

    res.status(201).json({ message: "Repartidor registrado exitosamente", id: insertResult.rows[0].id });
  } catch (error) {
    console.error("Error al registrar repartidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 🔹 Obtener la lista de repartidores
router.get("/list", async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone FROM deliverymen'); // No devolver la contraseña
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los repartidores" });
  }
});

// 🔹 Actualizar un repartidor
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password } = req.body;

  try {
    // Verificar si el repartidor existe
    const result = await pool.query('SELECT * FROM deliverymen WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Repartidor no encontrado" });
    }

    // Si se envió una nueva contraseña, cifrarla
    let hashedPassword = result.rows[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Actualizar los datos del repartidor
    await pool.query(
      'UPDATE deliverymen SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5',
      [name, email, phone, hashedPassword, id]
    );

    res.status(200).json({ message: "Repartidor actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar repartidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 🔹 Eliminar un repartidor
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el repartidor de la base de datos
    const result = await pool.query('DELETE FROM deliverymen WHERE id = $1', [id]);

    // Verificar si se eliminó un registro
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Repartidor no encontrado" });
    }

    res.status(200).json({ message: "Repartidor eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar repartidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}); 

module.exports = router;
