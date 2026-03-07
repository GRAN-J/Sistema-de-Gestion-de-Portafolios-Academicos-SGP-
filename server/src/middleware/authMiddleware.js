/**
 * @file authMiddleware.js
 * @description Middleware para proteger rutas mediante verificación de JWT.
 */

const jwt = require('jsonwebtoken');
const Usuario = require('../models/User');

/**
 * Middleware para proteger rutas privadas.
 * Verifica si la petición incluye un token Bearer válido en los headers.
 * Si es válido, adjunta el usuario decodificado al objeto request (req.user).
 * 
 * @async
 * @function protect
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @throws {Error} 401 - Si no hay token o es inválido.
 */
const protect = async (req, res, next) => {
  let token;

  // Verificar si existe el header de autorización y comienza con 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token del header (formato: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Decodificar y verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario por ID y excluir la contraseña
      req.user = await Usuario.findById(decoded.id).select('-password');

      // Continuar con la ejecución
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token fallido o expirado');
    }
  }

  // Si no se encontró token en el header
  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se proporcionó token de acceso');
  }
};

module.exports = { protect };
