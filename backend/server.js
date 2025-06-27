const dotenv = require("dotenv");
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET no está definido en .env");
  process.exit(1); // Detiene el servidor si falta la clave secreta
}

const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { authenticateToken } = require("./middlewares/auth"); // Importamos el middleware de autenticación

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});


pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL"))
  .catch((err) => console.error("❌ Error al conectar a PostgreSQL:", err));

module.exports = { pool }; // Exportamos `pool` para usarlo en las rutas

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://purificadoradiamante.vercel.app'], // Reemplaza con tu dominio real de Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));


// Importar rutas de los repartidores
const deliveryRoutes = require("./routes/deliverymen");
app.use("/api/deliverymen", deliveryRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡El servidor está funcionando con PostgreSQL! 🚀");
});

// 🔹 Ruta para el login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario es el admin de prueba
    if (email === 'admin@diamante.com' && password === '123456') {
      // Generar un token para el administrador
      const token = jwt.sign(
        { email: 'admin@diamante.com', role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );
      return res.status(200).json({ message: 'Login exitoso', token, role: 'admin' });
    }

    // Buscar al repartidor en la base de datos
    const result = await pool.query("SELECT * FROM deliverymen WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const deliveryman = result.rows[0];

    // Comparar la contraseña ingresada con la cifrada en la base de datos
    const isMatch = await bcrypt.compare(password, deliveryman.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar un token JWT para el repartidor
    const token = jwt.sign(
      { id: deliveryman.id, role: "repartidor" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({ message: "Login exitoso", token, role: "repartidor" });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta protegida para el panel del administrador
app.get("/admin-dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
  }
  res.json({ message: "Bienvenido al panel de administrador" });
});

// Ruta protegida para el panel de repartidor
app.get("/delivery-dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "repartidor") {
    return res.status(403).json({ message: "Acceso denegado. Solo repartidores." });
  }
  res.json({ message: "Bienvenido al panel de repartidor" });
});

// Ruta de prueba para el frontend
app.get("/api/test", (req, res) => {
  res.json({ message: "¡La conexión entre frontend y backend funciona!" });
});

//Ruta para los registros de clientes
const clientRoutes = require("./routes/clients");
app.use("/api/clients", clientRoutes);

// Ruta para registrar ventas
const salesRoutes = require("./routes/sales");
app.use("/api/sales", salesRoutes);

//Ruta para guardar reporte
const salesReportsRoutes = require('./routes/salesReports');
app.use('/api/reports', salesReportsRoutes);

//Ruta para los gastos
const expensesRoutes = require('./routes/expenses');
app.use('/api/expenses', expensesRoutes);

//Ruta para inventario
const inventoryRoutes = require("./routes/inventory");
app.use("/api/inventory", inventoryRoutes);

//Ruta reportes pdf
const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

//Ruta fiados
const fiadosRoutes = require("./routes/fiados");
app.use("/api/fiados", fiadosRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

