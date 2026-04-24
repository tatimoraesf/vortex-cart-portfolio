import 'dotenv/config';
import Fastify, { FastifyError } from 'fastify';
import S from 'fluent-json-schema';
import { ProductService } from './services/ProductService';
import { CartService } from './services/CartService';
import { cartRoutes } from './routes/cartRoutes';
import { productRoutes } from './routes/productRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { setupDatabase, pool } from './database';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined
    }
  });

  await setupDatabase();

  const productService = new ProductService(pool as any);
  const cartService = new CartService(pool, server.log);

  server.addHook('onClose', async () => {
    await pool.end();
    console.log('🐘 Conexões com o PostgreSQL encerradas.');
  });

  server.setErrorHandler((error: FastifyError, request, reply) => {
    server.log.error({
      err: error,
      method: request.method,
      url: request.url,
      requestId: request.id,
    }, 'Erro não tratado');

    const statusCode = error.statusCode || 500;

    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Erro interno do servidor' : error.message,
      requestId: request.id
    });
  });

  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: "vortex-cart"
    };
  });

  server.register(adminRoutes);
  server.register(cartRoutes, { cartService });
  server.register(productRoutes, { productService });

  return server;
}

if (require.main === module) {
  const start = async () => {
    try {
      const app = await buildServer();

      const port = Number(process.env.PORT) || 3000;
      const host = process.env.HOST || '0.0.0.0';

      await app.listen({ port, host });

    } catch (err) {
      console.error('❌ Erro ao subir o servidor:', err)
      process.exit(1);
    }
  }
  start();
}