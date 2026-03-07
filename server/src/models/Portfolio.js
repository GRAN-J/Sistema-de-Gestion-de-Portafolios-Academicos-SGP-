/**
 * @file Portfolio.js
 * @description Esquema de datos para los Portafolios Académicos.
 * Almacena la información de proyectos, autor, archivos y estado de revisión.
 */

const mongoose = require('mongoose');

/**
 * Esquema de Mongoose para el Portafolio.
 * @typedef {Object} PortfolioSchema
 * @property {String} titulo - Título descriptivo del portafolio.
 * @property {String} descripcion - Resumen del contenido y objetivos.
 * @property {ObjectId} autor - Referencia al Usuario (estudiante) creador.
 * @property {String} estado - Estado del flujo de revisión: 'borrador', 'enviado', 'aprobado', 'rechazado'.
 * @property {String} observacionesDocente - Comentarios de retroalimentación del docente.
 * @property {Array<String>} tecnologiasUtilizadas - Lista de tecnologías empleadas.
 * @property {String} enlaceRepositorio - URL al código fuente (Git).
 * @property {Object} archivo - Metadata del archivo subido.
 * @property {Date} fechaCreacion - Fecha de creación del registro.
 * @property {Date} fechaEnvio - Fecha en la que se cambió a 'enviado'.
 * @property {Date} fechaRevision - Fecha de la última revisión docente.
 */
const portfolioSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Por favor ingrese un título'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres'],
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres'],
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Relación con el modelo Usuario
    required: true,
  },
  estado: {
    type: String,
    enum: ['borrador', 'enviado', 'aprobado', 'rechazado'],
    default: 'borrador',
  },
  observacionesDocente: {
    type: String,
    default: '',
  },
  tecnologiasUtilizadas: {
    type: [String],
    default: [],
  },
  enlaceRepositorio: {
    type: String,
    // match: [
    //   /^(https?:\/\/)?(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/.+$/,
    //   'Por favor ingrese un enlace válido a un repositorio (GitHub, GitLab, Bitbucket)',
    // ],
  },
  archivos: [{
    nombreOriginal: { type: String }, // Nombre original del archivo subido
    nombreServidor: { type: String }, // Nombre único generado en el servidor
    ruta: { type: String }, // Ruta relativa de almacenamiento
    tipo: { type: String }, // MimeType
    tamaño: { type: Number }, // Tamaño en bytes
  }],
  // Campo legado para compatibilidad temporal (opcional, se puede borrar si se migra todo)
  // archivo: { ... }  <-- Se elimina para forzar el uso del array 'archivos'
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaEnvio: {
    type: Date,
  },
  fechaRevision: {
    type: Date,
  },
  docenteRevisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  // docenteAsignado: { ... } -> ELIMINADO: La asignación ahora es a nivel de Usuario (Estudiante)
  permiteEdicion: {
    type: Boolean,
    default: false,
    // Permite al estudiante editar incluso si el estado es 'rechazado'
  },
});

module.exports = mongoose.model('Portafolio', portfolioSchema);
