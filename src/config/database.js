const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ⬅️ IMPORTANTE: Render requiere SSL
  }
});

// Event listeners
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

// Función para inicializar la base de datos
const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Crear tabla conductores
    await client.query(`
      CREATE TABLE IF NOT EXISTS conductores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        licencia VARCHAR(20) UNIQUE NOT NULL,
        telefono VARCHAR(15) NOT NULL,
        fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla conductores verificada/creada');
    
    // Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conductores_licencia 
      ON conductores(licencia);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conductores_fecha 
      ON conductores(fecha_registro DESC);
    `);
    console.log('✅ Índices verificados/creados');
    
    // Verificar cantidad de registros
    const result = await client.query('SELECT COUNT(*) as total FROM conductores');
    console.log(`📊 Conductores registrados: ${result.rows[0].total}`);
    
    console.log('✅ Base de datos lista\n');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };