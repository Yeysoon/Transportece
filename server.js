/**
 * SERVIDOR PRINCIPAL
 * Sistema de Registro de Conductores
 * 
 * Este archivo inicializa el servidor Express y la base de datos PostgreSQL
 */

require('dotenv').config();
const app = require('./src/app');
const { initDB } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

/**
 * Función para inicializar el servidor
 */
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    console.log('📊 Entorno:', process.env.NODE_ENV || 'development');
    
    // Inicializar base de datos (crear tablas si no existen)
    await initDB();
    
    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('\n✅ Servidor iniciado correctamente');
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api/conductores`);
      console.log('\n📋 Endpoints disponibles:');
      console.log('   POST   /api/conductores           - Registrar conductor');
      console.log('   GET    /api/conductores           - Listar todos los conductores');
      console.log('   GET    /api/conductores/:licencia - Consultar conductor');
      console.log('   PUT    /api/conductores/:licencia - Actualizar conductor');
      console.log('   DELETE /api/conductores/:licencia - Eliminar conductor');
      console.log('\n💡 Presiona Ctrl+C para detener el servidor\n');
    });
  } catch (error) {
    console.error('\n❌ Error al iniciar el servidor:', error.message);
    console.error('💡 Verifica que tu base de datos esté correctamente configurada');
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();