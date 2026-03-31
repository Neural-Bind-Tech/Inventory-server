import { Server } from 'http';
import app from './app';
import config from './config';
import { prisma } from './lib/prisma';

let server: Server;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    server = app.listen(config.port, () => {
      
      console.log(`Server ready at http://localhost:${config.port}`);
    });

    server.on('error', (error: Error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await prisma.$disconnect();
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.error(
        'Could not close connections in time, forcefully shutting down'
      );
      process.exit(1);
    }, 30_000);
  }
}

// Error handlers
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  }
);

// Shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
