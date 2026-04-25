import { FastifyInstance } from "fastify";
import { pool } from "../database";
import S from "fluent-json-schema";

export async function adminRoutes(server: FastifyInstance) {
  server.post('/admin/reset-db', {
    schema: {
      description: 'Reseta o banco de dados com dados iniciais (requer autenticação)',
      tags: ['Admin'],
      response: {
        200: S.object().prop('message', S.string()),
        401: S.object().prop('error', S.string())
      }
    }
  }, async (request, reply) => {

    const token = request.headers['authorization']?.replace('Bearer ', '');
    if (!token || token !== process.env.ADMIN_API_KEY) {
      return reply.status(401).send({ error: 'Não autorizado' })
    }

    await pool.query('DELETE FROM cart');
    await pool.query('DELETE FROM products');

    await pool.query('INSERT INTO products (id, name, price, inventory) VALUES ($1, $2, $3, $4)', ['1', 'Teclado Mecânico', 150.00, 10]);
    await pool.query('INSERT INTO products (id, name, price, inventory) VALUES ($1, $2, $3, $4)', ['2', 'Mouse Gamer', 80.00, 5]);

    return { message: "Banco de dados resetado com sucesso!" };
  });
};