/**
 * @file db.js
 * @description Configuración de la conexión a la base de datos MongoDB.
 * Utiliza Mongoose para gestionar la conexión y manejar eventos.
 */

const mongoose = require('mongoose');

/**
 * Establece la conexión con la base de datos MongoDB.
 * @async
 * @function connectDB
 * @throws {Error} Si la conexión falla, termina el proceso con código 1.
 */
const connectDB = async () => {
  try {
    // Intenta conectar usando la URI definida en las variables de entorno
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    // Salir del proceso con error
    process.exit(1);
  }
};

module.exports = connectDB;
