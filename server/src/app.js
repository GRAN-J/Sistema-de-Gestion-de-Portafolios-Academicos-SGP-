const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/portfolios', require('./routes/portfolioRoutes'));

const mongoose = require('mongoose');

// Ruta base
app.get('/', (req, res) => {
  res.send('API de Gestión de Portafolios Académicos funcionando');
});

// Ruta de Health Check
app.get('/api/health', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'ok' : 'error';
  res.status(200).json({ status });
});

// Middleware de error
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`
  );
});
