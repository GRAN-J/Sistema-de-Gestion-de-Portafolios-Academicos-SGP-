/**
 * @file roleMiddleware.js
 * @description Middleware para control de acceso basado en roles (RBAC).
 */

/**
 * Genera un middleware que verifica si el usuario tiene uno de los roles permitidos.
 * Debe usarse después del middleware de autenticación (protect), ya que depende de req.user.
 * 
 * @function authorize
 * @param {...String} roles - Lista de roles permitidos (ej: 'admin', 'docente').
 * @returns {Function} Middleware de Express.
 * @throws {Error} 403 - Si el rol del usuario no está en la lista permitida.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Verificar si el rol del usuario actual está incluido en los roles permitidos
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403);
      throw new Error(
        `Acceso denegado: El rol '${req.user ? req.user.rol : 'desconocido'}' no tiene permisos para realizar esta acción.`
      );
    }
    next();
  };
};

module.exports = { authorize };
