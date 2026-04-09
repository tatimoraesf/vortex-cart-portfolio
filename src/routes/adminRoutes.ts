import { FastifyInstance } from "fastify";
import { pool } from "../database";

export async function adminRoutes(server: FastifyInstance) {
  server.post('/admin/reset-db', async (request, reply) => {

    await pool.query('DELETE FROM cart');
    await pool.query('DELETE FROM products');

    await pool.query('INSERT INTO products (id, name, price, inventory) VALUES ("1", "Teclado Mecânico", 150.00, 10)');
    await pool.query('INSERT INTO products (id, name, price, inventory) VALUES ("2", "Mouse Gamer", 80.00, 5)');

    return { message: "Banco de dados resetado com sucesso!" };
  });
};