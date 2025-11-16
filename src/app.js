const express = require('express');
const cors = require('cors');
const conductoresRoutes = require('./routes/conductor'); // ⬅️ CAMBIADO: conductor en lugar de conductores

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger personalizado (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: '🚛 API Sistema de Registro de Conductores',
    version: '1.0.0',
    endpoints: {
      conductores: '/api/conductores',
      documentacion: '/api/conductores (GET, POST)',
      consultar: '/api/conductores/:licencia (GET)',
      actualizar: '/api/conductores/:licencia (PUT)',
      eliminar: '/api/conductores/:licencia (DELETE)'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Rutas de la API
app.use('/api/conductores', conductoresRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    ruta: req.originalUrl 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: err.message 
  });
});

module.exports = app;