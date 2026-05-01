import 'dotenv/config';
import Fastify, { FastifyError } from 'fastify';
import S from 'fluent-json-schema';
import { ProductService } from './services/ProductService';
import { CartService } from './services/CartService';
import { cartRoutes } from './routes/cartRoutes';
import { productRoutes } from './routes/productRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { setupDatabase, pool } from './database';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined
    }
  });

  await server.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'DELETE'],
  });

  await server.register(fastifyStatic, {
    root: path.join(__dirname, '..'),
    prefix: '/',
  });

  await setupDatabase();

  //Swagger Documentation
  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Vortex Cart API',
        description: 'API de carrinho de compas com controle de estoque',
        version: '1.0.0'
      }
    }
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  })

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
    if (statusCode >= 500 && process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'vortex-cart',
          level: 'error',
          environment: process.env.NODE_ENV || 'development',
          method: request.method,
          url: request.url,
          requestId: request.id,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          github: 'https://github.com/tatimoraesf/vortex-cart-portfolio',
        })
      }).catch(() => { })
    };
  });

  server.setNotFoundHandler((request, reply) => {
    server.log.warn({
      method: request.method,
      url: request.url,
      requestId: request.id
    }, 'Rota não encontrada')
    reply.status(404).send({
      error: 'Rota não encontrada',
      requestId: request.id
    });
  });

  server.get('/health', {
    schema: {
      description: 'Verifica se a API está rodando',
      tags: ['Sistema'],
      response: {
        200: S.object()
          .prop('status', S.string())
          .prop('timestamp', S.string())
          .prop('service', S.string())
          .prop('database', S.string()),
        503: S.object()
          .prop('status', S.string())
          .prop('timestamp', S.string())
          .prop('service', S.string())
          .prop('database', S.string())
      }
    }
  }, async (request, reply) => {
    try {
      await pool.query('SELECT 1');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'vortex-cart',
        database: 'ok'
      }
    } catch (error) {
      return reply.status(503).send({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        service: 'vortex-cart',
        database: 'unavailable'
      });
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
  const testeHusky = 'bloquear';

}