/**
 * MODELO DE CONDUCTOR
 * Sistema de Registro de Conductores
 * 
 * Este archivo contiene todas las operaciones CRUD para la tabla conductores
 */

const { pool } = require('../config/database');

class Conductor {
  
  /**
   * Crear nuevo conductor
   * @param {Object} conductorData - Datos del conductor
   * @param {string} conductorData.nombre - Nombre del conductor
   * @param {string} conductorData.apellido - Apellido del conductor
   * @param {string} conductorData.licencia - Número de licencia (único)
   * @param {string} conductorData.telefono - Teléfono del conductor
   * @returns {Promise<Object>} Conductor creado
   */
  static async crear(conductorData) {
    const { nombre, apellido, licencia, telefono } = conductorData;
    
    const query = `
      INSERT INTO conductores (nombre, apellido, licencia, telefono, fecha_registro)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING *;
    `;
    
    const values = [nombre, apellido, licencia, telefono];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      // Si es error de duplicado (licencia única)
      if (error.code === '23505') {
        throw new Error('Ya existe un conductor con esa licencia');
      }
      throw error;
    }
  }

  /**
   * Obtener todos los conductores
   * @param {Object} options - Opciones de consulta
   * @param {number} options.limit - Límite de resultados
   * @param {number} options.offset - Desplazamiento para paginación
   * @param {string} options.ordenar - Campo por el que ordenar
   * @returns {Promise<Array>} Lista de conductores
   */
  static async obtenerTodos(options = {}) {
    const { 
      limit = 100, 
      offset = 0, 
      ordenar = 'fecha_registro DESC' 
    } = options;
    
    const query = `
      SELECT * FROM conductores 
      ORDER BY ${ordenar}
      LIMIT $1 OFFSET $2;
    `;
    
    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener conductor por licencia
   * @param {string} licencia - Número de licencia
   * @returns {Promise<Object|null>} Conductor encontrado o null
   */
  static async obtenerPorLicencia(licencia) {
    const query = 'SELECT * FROM conductores WHERE licencia = $1;';
    
    try {
      const result = await pool.query(query, [licencia]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener conductor por ID
   * @param {number} id - ID del conductor
   * @returns {Promise<Object|null>} Conductor encontrado o null
   */
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM conductores WHERE id = $1;';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar conductores por nombre o apellido
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<Array>} Lista de conductores que coinciden
   */
  static async buscar(termino) {
    const query = `
      SELECT * FROM conductores 
      WHERE nombre ILIKE $1 OR apellido ILIKE $1
      ORDER BY nombre, apellido;
    `;
    
    try {
      const result = await pool.query(query, [`%${termino}%`]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar conductor
   * @param {string} licencia - Número de licencia
   * @param {Object} conductorData - Datos a actualizar
   * @returns {Promise<Object|null>} Conductor actualizado o null
   */
  static async actualizar(licencia, conductorData) {
    const { nombre, apellido, telefono } = conductorData;
    
    const query = `
      UPDATE conductores 
      SET nombre = $1, apellido = $2, telefono = $3
      WHERE licencia = $4
      RETURNING *;
    `;
    
    const values = [nombre, apellido, telefono, licencia];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar conductor
   * @param {string} licencia - Número de licencia
   * @returns {Promise<Object|null>} Conductor eliminado o null
   */
  static async eliminar(licencia) {
    const query = 'DELETE FROM conductores WHERE licencia = $1 RETURNING *;';
    
    try {
      const result = await pool.query(query, [licencia]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar total de conductores
   * @returns {Promise<number>} Total de conductores
   */
  static async contar() {
    const query = 'SELECT COUNT(*) as total FROM conductores;';
    
    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener conductores registrados en un rango de fechas
   * @param {Date} fechaInicio - Fecha inicial
   * @param {Date} fechaFin - Fecha final
   * @returns {Promise<Array>} Lista de conductores
   */
  static async obtenerPorFecha(fechaInicio, fechaFin) {
    const query = `
      SELECT * FROM conductores 
      WHERE fecha_registro BETWEEN $1 AND $2
      ORDER BY fecha_registro DESC;
    `;
    
    try {
      const result = await pool.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si existe una licencia
   * @param {string} licencia - Número de licencia
   * @returns {Promise<boolean>} true si existe, false si no
   */
  static async existeLicencia(licencia) {
    const query = 'SELECT EXISTS(SELECT 1 FROM conductores WHERE licencia = $1);';
    
    try {
      const result = await pool.query(query, [licencia]);
      return result.rows[0].exists;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Conductor;