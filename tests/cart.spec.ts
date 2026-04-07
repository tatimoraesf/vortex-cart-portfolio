import supertest from 'supertest';
import { buildServer } from '../src/server';
import { describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals';

describe('API de Carrinho (Vortex Cart)', () => {
  let app: any;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  beforeEach(async () => {
    const db = (app as any).db;

    await db.run('DELETE FROM cart');
    await db.run('UPDATE products SET inventory = 5 WHERE id = "1"');
    await db.run('UPDATE products SET inventory = 0 WHERE id = "2"');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  test('GET /health deve retornar status 200 e confirmar que a API está online', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(404);

    const body = JSON.parse(response.payload);
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty('timestamp');
  })

  test('Deve retornar 200 ao buscar um produto pelo ID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/products/1'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe("1");
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
    const body = JSON.parse(response.payload);

    expect(body.length).toBeGreaterThan(0);
  })

  test('Deve retornar 404 ao tentar adicionar um produto inexistente', async () => {
    const response = await supertest(app.server)
      .post('/cart')
      .send({
        product_id: "999",
        quantity: 1
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Produto não existe no catálogo');
  })

  test('Deve retornar 422 ao tentar adicionar um produto com quantidade insuficiente', async () => {
    const response = await supertest(app.server)
      .post('/cart')
      .send({
        product_id: "1",
        quantity: 10
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Estoque insuficiente');
  });

  test('Deve retornar 400 para quantidade negativa', async () => {
    const response = await supertest(app.server)
      .post('/cart')
      .send({
        product_id: "1",
        quantity: -5
      })

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
  });

  test('Deve listar no GET o produto adicionado via POST', async () => {
    const postRes = await supertest(app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: 1 });

    expect(postRes.status).toBe(200);

    const response = await supertest(app.server).get('/cart');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].product_id).toBe("1");
  });

  test('Deve remover o produto do carrinho com sucesso', async () => {
    await supertest(app.server)
      .post('/cart')
      .send({ product_id: "1", quantity: 1 });

    const carrinho = await supertest(app.server).get('/cart');
    const idNoCarrinho = carrinho.body[0].id;

    const response = await supertest(app.server).delete(`/cart/${idNoCarrinho}`);
    expect(response.status).toBe(204);

    const db = (app as any).db;
    const checkInventory = await db.get('SELECT inventory FROM products WHERE id = "1"');
    expect(checkInventory.inventory).toBe(5);


    const checkCart = await supertest(app.server).get('/cart');
    expect(checkCart.body.length).toBe(0);
  });

  test('RACE CONDITION: Não deve permitir vender mais do que o estoque em pedidos simultâneos', async () => {
    const db = (app as any).db;
    await db.run('UPDATE products SET inventory = 1 WHERE id = "1"');

    const [res1, res2] = await Promise.all([
      app.inject({
        method: 'POST',
        url: '/cart',
        payload: { product_id: "1", quantity: 1 }
      }),
      app.inject({
        method: 'POST',
        url: '/cart',
        payload: { product_id: "1", quantity: 1 }
      })
    ]);

    const statuses = [res1.statusCode, res2.statusCode];

    expect(statuses).toContain(200);
    expect(statuses).toContain(422);

    const product = await db.get('SELECT inventory FROM products WHERE id = "2"');
    expect(product.inventory).toBe(0);

  })
})