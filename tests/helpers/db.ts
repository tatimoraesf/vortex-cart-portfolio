import { buildServer } from "../../src/server";
import { pool } from "../../src/database";

export function setupDb() {
  const ctx = { app: null as any };

  beforeAll(async () => {
    ctx.app = await buildServer();
    await ctx.app.ready();
  });

  beforeEach(async () => {
    // Reseta o banco para cada teste
    await pool.query('DELETE FROM cart');
    await pool.query('DELETE FROM products');
    await pool.query('INSERT INTO products (id, name, inventory, price) VALUES ($1, $2, $3, $4)',
      ['1', 'Teclado Mecânico', 5, 99.99]);
    await pool.query('INSERT INTO products (id, name, inventory, price) VALUES ($1, $2, $3, $4)',
      ['2', 'Mouse Gamer', 0, 49.99]);
  });

  afterAll(async () => {
    if (ctx.app) {
      await ctx.app.close();
    }
  });

  return ctx;
};