/**
 * @file portfolioRoutes.js
 * @description Rutas para la gestión de portafolios.
 * Aplica middleware de autenticación, autorización por roles y carga de archivos.
 */

const express = require('express');
const router = express.Router();
const {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioStats,
  downloadPortfolioFile
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Ruta base /api/portfolios
router
  .route('/')
  .get(protect, getPortfolios) // Todos pueden listar (filtrado por controlador)
  .post(
      protect, 
      authorize('estudiante'), // Solo estudiantes crean
      upload.array('archivos', 5), // Permitir hasta 5 archivos
      createPortfolio
  );

// Ruta de estadísticas (Docentes/Coordinadores)
router.get('/stats', protect, authorize('docente', 'coordinador'), getPortfolioStats);

// Ruta de descarga protegida (ahora recibe nombreServidor)
router.get('/:id/download/:filename', protect, downloadPortfolioFile);

// Rutas por ID
router
  .route('/:id')
  .get(protect, getPortfolio) // Ver detalle (validado por controlador)
  .put(
      protect, 
      upload.array('archivos', 5), // Permitir actualización de múltiples archivos
      updatePortfolio
  )
  .delete(protect, deletePortfolio);

module.exports = router;
