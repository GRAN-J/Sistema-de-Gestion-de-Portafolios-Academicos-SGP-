/**
 * @file uploadMiddleware.js
 * @description Configuración segura de Multer para la carga de archivos académicos.
 * Almacena archivos con nombres únicos y valida estrictamente tipos PDF/DOCX.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ruta absoluta para la carpeta de uploads (mejor práctica que relativa)
const uploadDir = path.join(__dirname, '../../uploads');

// Asegurar que existe la carpeta de uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generar nombre único: timestamp-randomString.ext
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomString}${ext}`);
  },
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Crear un error personalizado para manejarlo en el controlador o middleware de error
    const error = new Error('Tipo de archivo no válido. Solo se permiten PDF y DOCX.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

module.exports = upload;
