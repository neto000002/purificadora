const { Pool } = require("pg");
require("dotenv").config();

// Configurar la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER, // Usuario de la base de datos
  host: process.env.DB_HOST, // Host del servidor de BD
  database: process.env.DB_NAME, // Nombre de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña
  port: process.env.DB_PORT, // Puerto (por defecto 5432)
});

pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL"))
  .catch((err) => console.error("❌ Error al conectar a PostgreSQL:", err));

module.exports = { pool };
