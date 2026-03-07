/**
 * @file authRoutes.js
 * @description Definición de rutas de autenticación y recuperación de contraseñas.
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  getTeachers,
  getStudents,
  assignTeacherToStudent
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware'); // Importar authorize

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Ruta para obtener docentes (Solo Coordinadores)
router.get('/teachers', protect, authorize('coordinador'), getTeachers);

// Ruta para obtener estudiantes (Solo Coordinadores)
router.get('/students', protect, authorize('coordinador'), getStudents);

// Ruta para asignar docente a estudiante (Solo Coordinadores)
router.put('/assign-teacher', protect, authorize('coordinador'), assignTeacherToStudent);

// Rutas de recuperación de contraseña
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
