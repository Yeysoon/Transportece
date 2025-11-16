/**
 * RUTAS DE CONDUCTORES
 * Sistema de Registro de Conductores
 * 
 * Define todos los endpoints de la API para gestionar conductores
 */

const express = require('express');
const router = express.Router();
const conductoresController = require('../controllers/conductoresController');

// ============================================
// RUTAS CRUD
// ============================================

/**
 * @route   POST /api/conductores
 * @desc    Registrar nuevo conductor
 * @access  Público
 * @body    { nombre, apellido, licencia, telefono }
 */
router.post('/', conductoresController.registrarConductor);

/**
 * @route   GET /api/conductores
 * @desc    Obtener todos los conductores
 * @access  Público
 * @query   ?limit=10&offset=0&ordenar=nombre
 */
router.get('/', conductoresController.listarConductores);

/**
 * @route   GET /api/conductores/buscar/:termino
 * @desc    Buscar conductores por nombre o apellido
 * @access  Público
 */
router.get('/buscar/:termino', conductoresController.buscarConductores);

/**
 * @route   GET /api/conductores/stats
 * @desc    Obtener estadísticas de conductores
 * @access  Público
 */
router.get('/stats', conductoresController.obtenerEstadisticas);

/**
 * @route   GET /api/conductores/:licencia
 * @desc    Consultar conductor por licencia
 * @access  Público
 */
router.get('/:licencia', conductoresController.consultarConductor);

/**
 * @route   PUT /api/conductores/:licencia
 * @desc    Actualizar datos de conductor
 * @access  Público
 * @body    { nombre, apellido, telefono }
 */
router.put('/:licencia', conductoresController.actualizarConductor);

/**
 * @route   DELETE /api/conductores/:licencia
 * @desc    Eliminar conductor
 * @access  Público
 */
router.delete('/:licencia', conductoresController.eliminarConductor);

module.exports = router;