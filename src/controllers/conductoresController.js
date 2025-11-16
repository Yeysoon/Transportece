/**
 * CONTROLADOR DE CONDUCTORES
 * Sistema de Registro de Conductores
 * 
 * Contiene la lógica de negocio para todas las operaciones de conductores
 */

const Conductor = require('../models/conductor');

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Validar datos de conductor
 */
const validarDatosConductor = (datos) => {
  const errores = [];

  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.push('El nombre es requerido');
  } else if (datos.nombre.length > 50) {
    errores.push('El nombre debe tener máximo 50 caracteres');
  }

  if (!datos.apellido || datos.apellido.trim() === '') {
    errores.push('El apellido es requerido');
  } else if (datos.apellido.length > 50) {
    errores.push('El apellido debe tener máximo 50 caracteres');
  }

  if (!datos.licencia || datos.licencia.trim() === '') {
    errores.push('La licencia es requerida');
  } else if (datos.licencia.length > 20) {
    errores.push('La licencia debe tener máximo 20 caracteres');
  }

  if (!datos.telefono || datos.telefono.trim() === '') {
    errores.push('El teléfono es requerido');
  } else if (datos.telefono.length > 15) {
    errores.push('El teléfono debe tener máximo 15 caracteres');
  }

  return errores;
};

// ============================================
// CONTROLADORES
// ============================================

/**
 * POST /api/conductores
 * Registrar nuevo conductor
 */
exports.registrarConductor = async (req, res) => {
  try {
    const { nombre, apellido, licencia, telefono } = req.body;

    // Validar datos
    const errores = validarDatosConductor({ nombre, apellido, licencia, telefono });
    
    if (errores.length > 0) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        detalles: errores
      });
    }

    // Verificar si la licencia ya existe
    const conductorExistente = await Conductor.obtenerPorLicencia(licencia);
    if (conductorExistente) {
      return res.status(409).json({ 
        error: 'Conflicto',
        mensaje: 'Ya existe un conductor con esa licencia',
        conductor_existente: {
          nombre: conductorExistente.nombre,
          apellido: conductorExistente.apellido,
          fecha_registro: conductorExistente.fecha_registro
        }
      });
    }

    // Crear conductor
    const nuevoConductor = await Conductor.crear({ 
      nombre: nombre.trim(), 
      apellido: apellido.trim(), 
      licencia: licencia.trim().toUpperCase(), 
      telefono: telefono.trim() 
    });
    
    res.status(201).json({
      mensaje: 'Conductor registrado exitosamente',
      conductor: nuevoConductor
    });

  } catch (error) {
    console.error('❌ Error al registrar conductor:', error);
    res.status(500).json({ 
      error: 'Error al registrar conductor',
      mensaje: error.message 
    });
  }
};

/**
 * GET /api/conductores
 * Listar todos los conductores
 */
exports.listarConductores = async (req, res) => {
  try {
    // Parámetros de query opcionales
    const { limit, offset, ordenar } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
      ordenar: ordenar || 'fecha_registro DESC'
    };

    const conductores = await Conductor.obtenerTodos(options);
    const total = await Conductor.contar();
    
    res.status(200).json({
      total: total,
      cantidad: conductores.length,
      pagina: Math.floor(options.offset / options.limit) + 1,
      por_pagina: options.limit,
      conductores: conductores
    });

  } catch (error) {
    console.error('❌ Error al listar conductores:', error);
    res.status(500).json({ 
      error: 'Error al obtener conductores',
      mensaje: error.message 
    });
  }
};

/**
 * GET /api/conductores/:licencia
 * Consultar conductor por licencia
 */
exports.consultarConductor = async (req, res) => {
  try {
    const { licencia } = req.params;
    
    if (!licencia) {
      return res.status(400).json({ 
        error: 'Licencia no proporcionada' 
      });
    }

    const conductor = await Conductor.obtenerPorLicencia(licencia.toUpperCase());
    
    if (!conductor) {
      return res.status(404).json({ 
        error: 'No encontrado',
        mensaje: 'Conductor no encontrado con la licencia proporcionada',
        licencia: licencia
      });
    }

    res.status(200).json({
      mensaje: 'Conductor encontrado',
      conductor: conductor
    });

  } catch (error) {
    console.error('❌ Error al consultar conductor:', error);
    res.status(500).json({ 
      error: 'Error al consultar conductor',
      mensaje: error.message 
    });
  }
};

/**
 * PUT /api/conductores/:licencia
 * Actualizar conductor
 */
exports.actualizarConductor = async (req, res) => {
  try {
    const { licencia } = req.params;
    const { nombre, apellido, telefono } = req.body;

    // Validar que al menos un campo se está actualizando
    if (!nombre && !apellido && !telefono) {
      return res.status(400).json({ 
        error: 'Datos insuficientes',
        mensaje: 'Debe proporcionar al menos un campo para actualizar (nombre, apellido, telefono)'
      });
    }

    // Verificar que el conductor existe
    const conductorExistente = await Conductor.obtenerPorLicencia(licencia.toUpperCase());
    if (!conductorExistente) {
      return res.status(404).json({ 
        error: 'No encontrado',
        mensaje: 'Conductor no encontrado con la licencia proporcionada'
      });
    }

    // Preparar datos para actualizar (usar valores existentes si no se proporcionan nuevos)
    const datosActualizar = {
      nombre: nombre ? nombre.trim() : conductorExistente.nombre,
      apellido: apellido ? apellido.trim() : conductorExistente.apellido,
      telefono: telefono ? telefono.trim() : conductorExistente.telefono
    };

    // Validar los nuevos datos
    const errores = validarDatosConductor({
      ...datosActualizar,
      licencia: licencia // La licencia no se actualiza pero la incluimos para validación
    });

    if (errores.length > 0) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        detalles: errores
      });
    }

    // Actualizar conductor
    const conductorActualizado = await Conductor.actualizar(
      licencia.toUpperCase(), 
      datosActualizar
    );

    res.status(200).json({
      mensaje: 'Conductor actualizado exitosamente',
      conductor_anterior: conductorExistente,
      conductor_actualizado: conductorActualizado
    });

  } catch (error) {
    console.error('❌ Error al actualizar conductor:', error);
    res.status(500).json({ 
      error: 'Error al actualizar conductor',
      mensaje: error.message 
    });
  }
};

/**
 * DELETE /api/conductores/:licencia
 * Eliminar conductor
 */
exports.eliminarConductor = async (req, res) => {
  try {
    const { licencia } = req.params;

    if (!licencia) {
      return res.status(400).json({ 
        error: 'Licencia no proporcionada' 
      });
    }

    const conductorEliminado = await Conductor.eliminar(licencia.toUpperCase());
    
    if (!conductorEliminado) {
      return res.status(404).json({ 
        error: 'No encontrado',
        mensaje: 'Conductor no encontrado con la licencia proporcionada'
      });
    }

    res.status(200).json({
      mensaje: 'Conductor eliminado exitosamente',
      conductor_eliminado: conductorEliminado
    });

  } catch (error) {
    console.error('❌ Error al eliminar conductor:', error);
    res.status(500).json({ 
      error: 'Error al eliminar conductor',
      mensaje: error.message 
    });
  }
};

/**
 * GET /api/conductores/buscar/:termino
 * Buscar conductores por nombre o apellido
 */
exports.buscarConductores = async (req, res) => {
  try {
    const { termino } = req.params;

    if (!termino || termino.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Término de búsqueda inválido',
        mensaje: 'El término debe tener al menos 2 caracteres'
      });
    }

    const conductores = await Conductor.buscar(termino.trim());

    res.status(200).json({
      termino: termino,
      cantidad: conductores.length,
      conductores: conductores
    });

  } catch (error) {
    console.error('❌ Error al buscar conductores:', error);
    res.status(500).json({ 
      error: 'Error al buscar conductores',
      mensaje: error.message 
    });
  }
};

/**
 * GET /api/conductores/stats
 * Obtener estadísticas
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const total = await Conductor.contar();
    const conductores = await Conductor.obtenerTodos({ limit: 1000 });

    // Calcular estadísticas
    const hoy = new Date();
    const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    const registrosUltimos7dias = conductores.filter(c => 
      new Date(c.fecha_registro) >= hace7dias
    ).length;

    const registrosUltimos30dias = conductores.filter(c => 
      new Date(c.fecha_registro) >= hace30dias
    ).length;

    res.status(200).json({
      total_conductores: total,
      registros_ultimos_7_dias: registrosUltimos7dias,
      registros_ultimos_30_dias: registrosUltimos30dias,
      fecha_consulta: hoy.toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      mensaje: error.message 
    });
  }
};