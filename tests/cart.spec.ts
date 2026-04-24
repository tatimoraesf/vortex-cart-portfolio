import supertest from 'supertest';
import { buildServer } from '../src/server';
import { describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { pool } from '../src/database';
import { setupDb } from './helpers/db';

describe('Validar endpoint /cart', () => {
  const ctx = setupDb();

  test('Deve retornar 404 ao tentar adicionar um produto inexistente', async () => {
    const response = await supertest(ctx.app.server)
      .post('/cart')
      .send({ product_id: "999", quantity: 1 });
    expect(response.status).toBe(404);
  });

  test('Deve listar no GET o produto adicionado via POST', async () => {
    await supertest(ctx.app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: 1 });

    const response = await supertest(ctx.app.server).get('/cart');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('RACE CONDITION: Não deve permitir vender mais do que o estoque em pedidos simultâneos', async () => {
    await pool.query("UPDATE products SET inventory = 1 WHERE id = '1'");

    const [res1, res2] = await Promise.all([
      ctx.app.inject({ method: 'POST', url: '/cart', payload: { product_id: "1", quantity: 1 } }),
      ctx.app.inject({ method: 'POST', url: '/cart', payload: { product_id: "1", quantity: 1 } })
    ]);

    const statuses = [res1.statusCode, res2.statusCode];
    expect(statuses).toContain(200);
    expect(statuses).toContain(422);
  });

  test('Deve retornar 422 na tentativa de adicionar um produto com quantidade insuficiente', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/cart',
      payload: { product_id: "1", quantity: 10 }
    })
    expect(response.statusCode).toBe(422)
  })
  test('Deve retornar 400 ao tentar adicionar um valor zerado', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/cart',
      payload: { product_id: "1", quantity: 0 }
    })

    const corpo = JSON.parse(response.payload)
    expect(corpo.error).toBe('body/quantity must be >= 1')
    expect(response.statusCode).toBe(400)
  });

  test('Deve retornar 200 ao adicionar um produto no carrinho e atualizar o estoque', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/cart',
      payload: { product_id: "1", quantity: 1 }
    });
    const res = await pool.query("SELECT inventory FROM products WHERE id = '1'");

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload).message).toBe('Adicionado com sucesso!')
    expect(res.rows[0].inventory).toBe(4)
  });

  test('Deve retornar o estoque atualizado após a remoção do produto', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/cart',
      payload: { product_id: "1", quantity: 1 }
    });
    const carrinho = await ctx.app.inject({
      method: 'GET',
      url: '/cart',
    })
    const idNoCarrinho = JSON.parse(carrinho.payload)[0].id;
    await ctx.app.inject({
      method: 'DELETE',
      url: `/cart/${idNoCarrinho}`,
    });
    const res2 = await pool.query("SELECT inventory FROM products WHERE id = '1'");
    expect(res2.rows[0].inventory).toBe(5);
  });
});