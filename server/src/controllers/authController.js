/**
 * @file authController.js
 * @description Controlador para la gestión de autenticación y recuperación de contraseñas.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Usuario = require('../models/User');
const { sendResetEmail } = require('../services/emailService');

/**
 * Registra un nuevo usuario en el sistema.
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    res.status(400);
    throw new Error('Por favor agregue todos los campos requeridos (nombre, correo, password)');
  }

  const userExists = await Usuario.findOne({ correo });
  if (userExists) {
    res.status(400);
    throw new Error('El usuario con este correo ya existe');
  }

  // Registro público SIEMPRE es estudiante
  const user = await Usuario.create({
    nombre,
    correo,
    password,
    rol: 'estudiante',
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      token: generateToken(user._id, user.rol),
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

/**
 * Autentica un usuario y devuelve un token JWT.
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;

  const user = await Usuario.findOne({ correo }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      token: generateToken(user._id, user.rol),
    });
  } else {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }
});

/**
 * Obtiene la información del usuario actual.
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

/**
 * Crea un usuario con rol específico (Solo para Coordinadores).
 */
const createUserByAdmin = asyncHandler(async (req, res) => {
    const { nombre, correo, password, rol } = req.body;
    
    const userExists = await Usuario.findOne({ correo });
    if (userExists) {
        res.status(400);
        throw new Error('El usuario ya existe');
    }

    const user = await Usuario.create({
        nombre,
        correo,
        password,
        rol 
    });

    res.status(201).json({
        _id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
    });
});

/**
 * @desc    Solicitar recuperación de contraseña
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { correo } = req.body;

  const user = await Usuario.findOne({ correo });

  if (!user) {
    // Por seguridad, no revelamos si el usuario existe o no
    return res.status(200).json({ success: true, data: 'Correo de recuperación enviado' });
  }

  // Obtener token de restablecimiento
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Crear URL de restablecimiento usando variable de entorno
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  try {
    await sendResetEmail(user.correo, resetUrl);

    res.status(200).json({ success: true, data: 'Correo de recuperación enviado' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('El correo no pudo ser enviado');
  }
});

/**
 * @desc    Restablecer contraseña
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  
  if (!password || password.length < 6) {
      res.status(400);
      throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Hashear el token recibido para buscar en la BD
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await Usuario.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Verificar que no haya expirado
  });

  if (!user) {
    res.status(400);
    throw new Error('Token inválido o expirado');
  }

  // Establecer nueva contraseña
  user.password = password; // El middleware pre-save lo hasheará automáticamente
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // No devolver token para forzar login manual
  res.status(200).json({
    success: true,
    data: 'Contraseña actualizada correctamente. Por favor inicie sesión.',
  });
});

/**
 * Obtiene lista de docentes (Solo Coordinadores).
 * @route   GET /api/auth/teachers
 * @access  Private (Coordinador)
 */
const getTeachers = asyncHandler(async (req, res) => {
    // Buscar usuarios con rol 'docente'
    const teachers = await Usuario.find({ rol: 'docente' }).select('nombre correo');
    
    res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers
    });
});

/**
 * Obtiene lista de estudiantes (Solo Coordinadores).
 * @route   GET /api/auth/students
 * @access  Private (Coordinador)
 */
const getStudents = asyncHandler(async (req, res) => {
    // Buscar usuarios con rol 'estudiante' y poblar docente asignado
    const students = await Usuario.find({ rol: 'estudiante' })
        .select('nombre correo docenteAsignado')
        .populate('docenteAsignado', 'nombre correo');
    
    res.status(200).json({
        success: true,
        count: students.length,
        data: students
    });
});

/**
 * Asigna un docente a un estudiante.
 * @route   PUT /api/auth/assign-teacher
 * @access  Private (Coordinador)
 */
const assignTeacherToStudent = asyncHandler(async (req, res) => {
    const { studentId, teacherId } = req.body;

    const student = await Usuario.findById(studentId);
    if (!student || student.rol !== 'estudiante') {
        res.status(404);
        throw new Error('Estudiante no encontrado');
    }

    if (teacherId) {
        const teacher = await Usuario.findById(teacherId);
        if (!teacher || teacher.rol !== 'docente') {
            res.status(404);
            throw new Error('Docente no encontrado');
        }
        student.docenteAsignado = teacherId;
    } else {
        // Si teacherId es null o vacío, desasignamos
        student.docenteAsignado = undefined;
    }

    await student.save();

    res.status(200).json({
        success: true,
        message: 'Docente asignado correctamente',
        data: student
    });
});

/**
 * Genera token JWT incluyendo ID y Rol.
 */
const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  createUserByAdmin,
  forgotPassword,
  resetPassword,
  getTeachers,
  getStudents,
  assignTeacherToStudent
};
