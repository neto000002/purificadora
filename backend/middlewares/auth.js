// middlewares/auth.js

const dotenv = require("dotenv");
dotenv.config(); 

const jwt = require("jsonwebtoken");

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]; // Obtener el token del encabezado

  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  // Eliminar el prefijo "Bearer " si está presente
  const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;

  // Verificar el token con la clave secreta
  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }

    req.user = user; // Adjuntamos la información del usuario al objeto de la petición
    next(); // Continuamos con la siguiente función en la cadena de middlewares/rutas
  });
};

module.exports = { authenticateToken }; // Exportamos el middleware para usarlo en otras partes
