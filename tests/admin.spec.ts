import { setupDb } from "./helpers/db";
import { pool } from "../src/database";

describe('Valida endpoint /admin', () => {
  const ctx = setupDb();

  test('Deve retornar 401 ao tentar resetar o banco sem autorização', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/admin/reset-db',
      headers: {
        'authorization': ''
      }
    })
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.payload).error).toBe('Não autorizado');
  });

  test('Deve retornar 401 ao resetar o banco com token inválido', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/admin/reset-db',
      headers: {
        'authorization': 'Bearer token-invalido'
      }
    })
    expect(response.statusCode).toBe(401)
    expect(JSON.parse(response.payload).error).toBe('Não autorizado')
  });

  test('Deve retornar 200 ao resetar o banco com token válido', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/admin/reset-db',
      headers: {
        'authorization': 'Bearer ' + process.env.ADMIN_API_KEY
      }
    });
    const products = await pool.query("SELECT * FROM products");
    const cart = await pool.query("SELECT * FROM cart");

    expect(products.rowCount).toBe(2);
    expect(cart.rowCount).toBe(0);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).message).toBe('Banco de dados resetado com sucesso!');
  });

});