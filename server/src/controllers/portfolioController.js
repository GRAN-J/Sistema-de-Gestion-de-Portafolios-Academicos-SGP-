/**
 * @file portfolioController.js
 * @description Controlador para la gestión de Portafolios Académicos.
 * Incluye operaciones CRUD completas, filtrado avanzado y gestión de archivos.
 */

const asyncHandler = require('express-async-handler');
const Portfolio = require('../models/Portfolio');
const path = require('path');
const fs = require('fs');

const Usuario = require('../models/User'); // Importar modelo de Usuario

/**
 * Obtiene una lista de portafolios con opciones de filtrado, paginación y selección de campos.
 * @route   GET /api/portfolios
 * @access  Private
 */
const getPortfolios = asyncHandler(async (req, res) => {
  // 1. Procesar filtros básicos desde la URL (select, sort, page, limit)
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Convertir operadores avanzados de URL (gte, gt, etc.) a formato Mongo ($gte)
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|ne)\b/g, (match) => `$${match}`);
  
  // Objeto base de filtros
  let filter = JSON.parse(queryStr);

  // 2. Aplicar Reglas de Negocio y Seguridad (Directamente al objeto filter)
  
  // --- ESTUDIANTE ---
  if (req.user.rol === 'estudiante') {
    filter.autor = req.user.id;
  }
  
  // --- DOCENTE ---
  if (req.user.rol === 'docente') {
    // Buscar estudiantes asignados
    const estudiantesAsignados = await Usuario.find({ docenteAsignado: req.user.id }).select('_id');
    const idsEstudiantes = estudiantesAsignados.map(u => u._id);

    // Forzar filtro: Solo ver proyectos de mis estudiantes
    filter.autor = { $in: idsEstudiantes };

    // Forzar filtro: No ver borradores (a menos que explícitamente se excluyan de otra forma, pero esto asegura la regla)
    // Si ya viene un filtro de estado, nos aseguramos que no sea 'borrador'
    if (filter.estado) {
        if (filter.estado === 'borrador') {
             // Si pide ver borradores explícitamente, bloqueamos devolviendo nada o forzando error.
             // Mejor forzamos a que busque 'ne: borrador'
             filter.estado = { $ne: 'borrador' };
        }
    } else {
        // Si no especifica estado, por defecto excluimos borradores
        filter.estado = { $ne: 'borrador' };
    }
    
    // Limpieza: Asegurar que no se filtre por 'docenteAsignado' (campo obsoleto)
    delete filter.docenteAsignado;
  }

  // 3. Construir la consulta Mongoose
  let query = Portfolio.find(filter)
    .populate('autor', 'nombre correo')
    .populate('docenteRevisor', 'nombre correo');

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-fechaCreacion');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Portfolio.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);
  const portfolios = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: portfolios.length,
    pagination,
    data: portfolios,
  });
});

/**
 * Obtiene un único portafolio por su ID.
 * @route   GET /api/portfolios/:id
 * @access  Private
 */
const getPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id)
    .populate('autor', 'nombre correo')
    .populate('docenteRevisor', 'nombre correo'); // Poblar información del revisor

  if (!portfolio) {
    res.status(404);
    throw new Error('Portafolio no encontrado');
  }

  if (req.user.rol === 'estudiante' && portfolio.autor._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('No autorizado para ver este portafolio');
  }

  // Seguridad: Docentes no pueden ver borradores ni por ID directo
  if (req.user.rol === 'docente' && portfolio.estado === 'borrador') {
    res.status(403);
    throw new Error('No tiene permiso para ver borradores.');
  }

  res.status(200).json({ success: true, data: portfolio });
});

/**
 * Crea un nuevo portafolio.
 * @route   POST /api/portfolios
 * @access  Private (Solo Estudiantes)
 */
const createPortfolio = asyncHandler(async (req, res) => {
  if (req.user.rol !== 'estudiante') {
    res.status(403);
    throw new Error('Solo los estudiantes pueden crear portafolios');
  }

  const { titulo, descripcion, enlaceRepositorio, tecnologiasUtilizadas } = req.body;

  let archivosData = [];
  if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const relativePath = 'uploads/' + file.filename;
        
        // CORRECCIÓN UTF-8:
        // Multer a veces recibe los nombres en 'latin1' (ISO-8859-1) en lugar de UTF-8.
        // Convertimos manualmente Buffer -> string para arreglar tildes/ñ.
        const nombreOriginalUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');

        archivosData.push({
            nombreOriginal: nombreOriginalUtf8,
            nombreServidor: file.filename,
            ruta: relativePath,
            tipo: file.mimetype,
            tamaño: file.size
        });
      });
  }

  // Verificar si el estudiante tiene un docente asignado previamente
  const estudiante = await Usuario.findById(req.user.id);
  const docenteAsignado = estudiante.docenteAsignado || undefined;

  const portfolio = await Portfolio.create({
      titulo,
      descripcion,
      enlaceRepositorio,
      tecnologiasUtilizadas: tecnologiasUtilizadas ? tecnologiasUtilizadas : [],
      autor: req.user.id,
      estado: 'borrador',
      archivos: archivosData,
      docenteAsignado: docenteAsignado // Heredar docente del perfil del estudiante
  });

  res.status(201).json({ success: true, data: portfolio });
});

/**
 * Actualiza un portafolio existente.
 * @route   PUT /api/portfolios/:id
 * @access  Private
 */
const updatePortfolio = asyncHandler(async (req, res) => {
  let portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    res.status(404);
    throw new Error('Portafolio no encontrado');
  }

  // --- LOGICA ESTUDIANTE ---
  if (req.user.rol === 'estudiante') {
    if (portfolio.autor.toString() !== req.user.id) {
      res.status(403);
      throw new Error('No autorizado');
    }

    // Permitir editar si es borrador O si el docente activó "permiteEdicion" (y el estado es rechazado)
    const canEdit = portfolio.estado === 'borrador' || (portfolio.estado === 'rechazado' && portfolio.permiteEdicion);

    if (!canEdit) {
        res.status(400);
        throw new Error('No se puede editar un portafolio que ya ha sido enviado o revisado sin permiso del docente');
    }

    if (req.body.estado === 'enviado') {
        req.body.fechaEnvio = Date.now();
        // Si reenvía, desactivamos el permiso de edición para volver al ciclo normal
        req.body.permiteEdicion = false; 
    }

    // Manejo de Archivos (Reemplazo seguro)
    // Si se suben nuevos archivos, reemplazamos los existentes
    // O podríamos hacer un append, pero para simplificar la gestión en esta fase: reemplazo total.
    if (req.files && req.files.length > 0) {
        
        // 1. Eliminar archivos anteriores físicos
        if (portfolio.archivos && portfolio.archivos.length > 0) {
            portfolio.archivos.forEach(file => {
                const oldPath = path.join(__dirname, '../../', file.ruta);
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    } catch (err) {
                        console.error('Error borrando archivo antiguo:', err);
                    }
                }
            });
        }
        
        // 2. Crear metadata para nuevos archivos
        const nuevosArchivos = req.files.map(file => {
            // CORRECCIÓN UTF-8 para update también
            const nombreOriginalUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');
            return {
                nombreOriginal: nombreOriginalUtf8,
                nombreServidor: file.filename,
                ruta: 'uploads/' + file.filename,
                tipo: file.mimetype,
                tamaño: file.size
            };
        });

        req.body.archivos = nuevosArchivos;
    }

    delete req.body.observacionesDocente;
    delete req.body.fechaRevision;
    delete req.body.docenteRevisor;
  }

  // --- LOGICA DOCENTE ---
  if (req.user.rol === 'docente') {
      const allowedUpdates = {};
      
      if (req.body.observacionesDocente) allowedUpdates.observacionesDocente = req.body.observacionesDocente;
      
      // Permitir al docente cambiar 'permiteEdicion'
      if (req.body.permiteEdicion !== undefined) {
          allowedUpdates.permiteEdicion = req.body.permiteEdicion;
      }

      if (req.body.estado) {
          if (!['aprobado', 'rechazado'].includes(req.body.estado)) {
              res.status(400);
              throw new Error('Estado inválido para docente. Use: aprobado, rechazado');
          }
          allowedUpdates.estado = req.body.estado;
          allowedUpdates.fechaRevision = Date.now();
          allowedUpdates.docenteRevisor = req.user.id; // Registrar quién revisó
      }
      req.body = allowedUpdates;
  }

  // --- LOGICA COORDINADOR ---
  if (req.user.rol === 'coordinador') {
      // El Coordinador SOLO puede asignar docentes
      const allowedUpdates = {};
      
      if (req.body.docenteAsignado) {
          allowedUpdates.docenteAsignado = req.body.docenteAsignado;
      } else {
          res.status(400);
          throw new Error('El coordinador solo puede asignar docentes.');
      }
      
      req.body = allowedUpdates;
  }

  portfolio = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  .populate('docenteRevisor', 'nombre correo')
  .populate('docenteAsignado', 'nombre correo'); // Devolver info del docente asignado

  res.status(200).json({ success: true, data: portfolio });
});

/**
 * Elimina un portafolio.
 * @route   DELETE /api/portfolios/:id
 * @access  Private
 */
const deletePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    res.status(404);
    throw new Error('Portafolio no encontrado');
  }

  if (portfolio.autor.toString() !== req.user.id && req.user.rol === 'estudiante') {
    res.status(403);
    throw new Error('No autorizado');
  }
  
  if (req.user.rol !== 'estudiante') {
      res.status(403);
      throw new Error('Solo el autor puede eliminar su portafolio');
  }

  // Borrar archivos físicos asociados
  if (portfolio.archivos && portfolio.archivos.length > 0) {
      portfolio.archivos.forEach(file => {
          const filePath = path.join(__dirname, '../../', file.ruta);
          if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (err) {
                console.error('Error borrando archivo:', err);
              }
          }
      });
  }

  await portfolio.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

/**
 * Obtiene estadísticas agregadas de los portafolios por estado.
 * @route   GET /api/portfolios/stats
 * @access  Private (Docente/Coordinador)
 */
const getPortfolioStats = asyncHandler(async (req, res) => {
    if (req.user.rol === 'estudiante') {
        res.status(403);
        throw new Error('Acceso denegado');
    }

    let matchStage = {};

    // Si es docente, solo contar proyectos de estudiantes asignados
    if (req.user.rol === 'docente') {
        const estudiantesAsignados = await Usuario.find({ docenteAsignado: req.user.id }).select('_id');
        const idsEstudiantes = estudiantesAsignados.map(u => u._id);
        
        matchStage.autor = { $in: idsEstudiantes };
        
        // También ocultar borradores para que coincida con la lista
        matchStage.estado = { $ne: 'borrador' };
    }

    const stats = await Portfolio.aggregate([
        { $match: matchStage }, // Filtrar antes de agrupar
        {
            $group: {
                _id: '$estado',
                count: { $sum: 1 }
            }
        }
    ]);

    const formattedStats = stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    res.status(200).json({ success: true, data: formattedStats });
});

/**
 * Descarga un archivo específico del portafolio.
 * @route   GET /api/portfolios/:id/download/:filename
 * @access  Private (Autor, Docente, Coordinador)
 */
const downloadPortfolioFile = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  
  if (!portfolio) {
    res.status(404);
    throw new Error('Portafolio no encontrado');
  }

  // Verificar permisos
  const isAuthor = req.user.rol === 'estudiante' && portfolio.autor.toString() === req.user.id;
  const isStaff = ['docente', 'coordinador'].includes(req.user.rol);

  if (!isAuthor && !isStaff) {
    res.status(403);
    throw new Error('No autorizado para descargar archivos de este proyecto');
  }
  
  // Buscar el archivo solicitado dentro del array de archivos
  const requestedFilename = req.params.filename;
  const fileData = portfolio.archivos.find(f => f.nombreServidor === requestedFilename);

  if (!fileData) {
    res.status(404);
    throw new Error('Archivo no encontrado en este portafolio');
  }

  const filePath = path.join(__dirname, '../../', fileData.ruta);

  // Seguridad: Evitar Path Traversal
  // (Aunque ya validamos contra la base de datos, doble check)
  if (!filePath.startsWith(path.join(__dirname, '../../uploads'))) {
    res.status(403);
    throw new Error('Acceso denegado: Ruta inválida');
  }

  if (fs.existsSync(filePath)) {
    res.download(filePath, fileData.nombreOriginal);
  } else {
    res.status(404);
    throw new Error('El archivo físico no existe en el servidor');
  }
});

module.exports = {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioStats,
  downloadPortfolioFile
};
