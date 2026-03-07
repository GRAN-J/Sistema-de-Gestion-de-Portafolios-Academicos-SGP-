/**
 * @file errorMiddleware.js
 * @description Middleware centralizado para el manejo de errores en la aplicación.
 * Intercepta cualquier error lanzado en los controladores y devuelve una respuesta JSON estructurada.
 */

/**
 * Middleware para capturar y formatear errores.
 * 
 * @function errorHandler
 * @param {Error} err - Objeto de error capturado.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Determinar el código de estado: usar el existente si es diferente de 200, sino 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  // Respuesta JSON estándar para errores
  res.json({
    message: err.message || 'Error interno del servidor',
    // Mostrar el stack trace solo en entorno de desarrollo para depuración
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
