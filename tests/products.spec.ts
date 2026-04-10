import { setupDb } from "./helpers/db";

describe('Valida endpoint /products', () => {
  const ctx = setupDb();

  test('Deve retornar 200 ao buscar um produto pelo ID', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/products/1'
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).id).toBe("1");
  });

  test('Deve retornar 404 ao buscar um produto inexistente', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/products/999'
    });
    expect(response.statusCode).toBe(404);
  });

  test('Deve retornar status 200 e um array com pelo menos 1 produto', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/products'
    })

    const lista = JSON.parse(response.payload)

    expect(response.statusCode).toBe(200)
    expect(Array.isArray(lista)).toBe(true)
    expect(lista.length).toBeGreaterThan(0)
  });
});