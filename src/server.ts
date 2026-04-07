import Fastify from 'fastify';
import S from 'fluent-json-schema';
import { setupDatabase } from './database';
import { ProductService } from './services/ProductService';
import { CartService } from './services/CartService';
import { cartRoutes } from './routes/cartRoutes';
import { productRoutes } from './routes/productRoutes';
import { adminRoutes } from './routes/adminRoutes';

export async function buildServer() {
  const server = Fastify({ logger: false });
  const db = await setupDatabase();

  (server as any).db = db;

  const productService = new ProductService(db);
  const cartService = new CartService(db);


  server.register(adminRoutes);
  server.register(cartRoutes, { cartService });
  server.register(productRoutes, { productService });

  return server;
}

if (require.main === module) {
  const start = async () => {
    try {
      const app = await buildServer();
      await app.listen({ port: 3000, host: '0.0.0.0' });
      console.log('🚀 Servidor rodando em http://0.0.0.0:3000');
    } catch (err) {
      console.error('❌ Erro ao subir o servidor:', err)
      process.exit(1);
    }
  }
  start();
}