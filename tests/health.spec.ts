import { setupDb } from "./helpers/db";

describe('Valida endpoint /health', () => {
  const ctx = setupDb();

  test('GET /health deve retornar status 200 e confirmar que a API está online', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/health'
    });
    const body = JSON.parse(response.payload);
    
    expect(response.statusCode).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("vortex-cart");
    expect(body.database).toBe("ok");
  });
});