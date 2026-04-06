import { FastifyInstance } from "fastify";

export async function adminRoutes(server: FastifyInstance) {

  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: "vortex-cart"
    };
  });

  server.post('/admin/reset-db', async (request, reply) => {
    const db = (server as any).db;

    await db.run('DELETE FROM cart');
    await db.run('DELETE FROM products');

    await db.run('INSERT INTO products (id, name, price, inventory) VALUES ("1", "Teclado Mecânico", 150.00, 10)');
    await db.run('INSERT INTO products (id, name, price, inventory) VALUES ("2", "Mouse Gamer", 80.00, 5)');

    return { message: "Banco de dados resetado com sucesso!" };
  });
};