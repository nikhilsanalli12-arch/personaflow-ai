const app = require('./app');
const config = require('./config');
const db = require('./db');

async function startServer() {
  try {
    console.log('Initializing PersonaFlow AI storage and services...');
    await db.initDb();

    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`PersonaFlow AI Backend operational`);
      console.log(`Port: ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health Check: http://localhost:${config.port}/api/health`);
      console.log(`====================================================`);
    });

    const shutdown = () => {
      console.log('Shutting down PersonaFlow AI backend gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Fatal failure starting PersonaFlow AI backend:', err);
    process.exit(1);
  }
}

startServer();
