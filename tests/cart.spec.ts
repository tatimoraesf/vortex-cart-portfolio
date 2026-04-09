import supertest from 'supertest';
import { buildServer } from '../src/server';
import { describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { pool } from '../src/database';

describe('API de Carrinho (Vortex Cart)', () => {
  let app: any;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  beforeEach(async () => {
    // Reseta o banco para cada teste
    await pool.query('DELETE FROM cart');
    await pool.query("UPDATE products SET inventory = 5 WHERE id = '1'");
    await pool.query("UPDATE products SET inventory = 0 WHERE id = '2'");
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      // O app.close() já encerra o pool se estiver configurado no server.ts
    }
  });

  test('GET /health deve retornar status 200 e confirmar que a API está online', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).status).toBe("ok");
  });

  test('Deve retornar 200 ao buscar um produto pelo ID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/products/1'
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).id).toBe("1");
  });

  test('Deve retornar 404 ao buscar um produto inexistente', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/products/999'
    });
    expect(response.statusCode).toBe(404);
  });

  test('GET /products deve retornar uma lista de produtos inicializada', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/products'
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).length).toBeGreaterThan(0);
  });

  test('Deve retornar 404 ao tentar adicionar um produto inexistente', async () => {
    const response = await supertest(app.server)
      .post('/cart')
      .send({ product_id: "999", quantity: 1 });
    expect(response.status).toBe(404);
  });

  test('Deve retornar 422 ao tentar adicionar um produto com quantidade insuficiente', async () => {
    const response = await supertest(app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: 10 });
    expect(response.status).toBe(422);
  });

  test('Deve retornar 400 para quantidade negativa', async () => {
    const response = await supertest(app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: -5 });
    expect(response.status).toBe(400);
  });

  test('Deve listar no GET o produto adicionado via POST', async () => {
    await supertest(app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: 1 });

    const response = await supertest(app.server).get('/cart');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test('Deve remover o produto do carrinho com sucesso', async () => {
    await supertest(app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: 1 });

    const carrinho = await supertest(app.server).get('/cart');
    const idNoCarrinho = carrinho.body[0].id;

    await supertest(app.server).delete(`/cart/${idNoCarrinho}`);

    const res = await pool.query("SELECT inventory FROM products WHERE id = '1'");
    expect(res.rows[0].inventory).toBe(5);
  });

  test('RACE CONDITION: Não deve permitir vender mais do que o estoque em pedidos simultâneos', async () => {
    await pool.query("UPDATE products SET inventory = 1 WHERE id = '1'");

    const [res1, res2] = await Promise.all([
      app.inject({ method: 'POST', url: '/cart', payload: { product_id: "1", quantity: 1 } }),
      app.inject({ method: 'POST', url: '/cart', payload: { product_id: "1", quantity: 1 } })
    ]);

    const statuses = [res1.statusCode, res2.statusCode];
    expect(statuses).toContain(200);
    expect(statuses).toContain(422);
  });
});