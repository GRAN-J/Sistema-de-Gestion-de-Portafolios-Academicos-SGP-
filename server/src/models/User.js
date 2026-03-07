/**
 * @file User.js
 * @description Esquema de datos para usuarios (Estudiantes, Docentes, Coordinadores).
 * Define la estructura de los documentos en la colección 'usuarios'.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Esquema de Mongoose para el Usuario.
 * @typedef {Object} UserSchema
 * @property {String} nombre - Nombre completo del usuario.
 * @property {String} correo - Correo electrónico único del usuario.
 * @property {String} password - Contraseña encriptada.
 * @property {String} rol - Rol del usuario: 'estudiante', 'docente', 'coordinador'.
 * @property {Date} fechaRegistro - Fecha de creación de la cuenta.
 * @property {String} resetPasswordToken - Token de recuperación hasheado.
 * @property {Date} resetPasswordExpire - Fecha de expiración del token.
 */
const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese un nombre'],
    trim: true,
  },
  correo: {
    type: String,
    required: [true, 'Por favor ingrese un correo'],
    unique: true, // Asegura que no haya correos duplicados
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un correo válido',
    ],
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: 6,
    select: false, // Por seguridad, no devolver la contraseña en consultas por defecto
  },
  rol: {
    type: String,
    enum: ['estudiante', 'docente', 'coordinador'],
    default: 'estudiante',
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Relación: Si es estudiante, puede tener un docente asignado previamente por el coordinador
  docenteAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
  }
}, { timestamps: true });

/**
 * Middleware de Mongoose: 'pre-save'.
 * Se ejecuta antes de guardar un usuario en la base de datos.
 * Encripta la contraseña si ha sido modificada o es nueva.
 */
userSchema.pre('save', async function (next) {
  // Si la contraseña no ha sido modificada, pasar al siguiente middleware
  if (!this.isModified('password')) {
    return next();
  }
  
  // Generar salt y hashear contraseña
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Método de instancia para comparar contraseñas.
 * @method matchPassword
 * @param {String} enteredPassword - Contraseña ingresada por el usuario en texto plano.
 * @returns {Boolean} Verdadero si las contraseñas coinciden, Falso si no.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Genera y hashea un token para restablecer la contraseña.
 * @method getResetPasswordToken
 * @returns {String} Token original (sin hash) para enviar por email.
 */
userSchema.methods.getResetPasswordToken = function () {
  // Generar token aleatorio
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hashear token y guardar en campo resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración (15 minutos)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('Usuario', userSchema);
