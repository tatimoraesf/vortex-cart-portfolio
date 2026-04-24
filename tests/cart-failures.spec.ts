import { CartService } from '../src/services/CartService';

describe('CartService - falhas de banco', () => {
  const fakeLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }

  it('deve fazer ROLLBACK quando o INSERT no carrinho falhar', async () => {
    const queriesExecutadas: string[] = [];
    const fakeClient = {
      query: jest.fn(async (sql: string) => {
        queriesExecutadas.push(sql);
        if (sql.startsWith('SELECT')) {
          return { rows: [{ id: '1', name: 'Produto Teste', inventory: 10 }], rowCount: 1 };
        }
        if (sql.startsWith('UPDATE')) {
          return { rows: [], rowCount: 1 };
        }
        if (sql.startsWith('INSERT')) {
          throw new Error('falha simulada de rede no INSERT');
        }
        return { rows: [], rowCount: 0 };
      }),
      release: jest.fn(),
    };
    const fakePool = {
      connect: jest.fn(async () => fakeClient),
    };

    const service = new CartService(fakePool as any, fakeLogger as any);

    await expect(service.addToCart('1', 1)).rejects.toThrow('INTERNAL_ERROR');

    expect(queriesExecutadas).toContain('ROLLBACK');

    expect(queriesExecutadas).not.toContain('COMMIT');
    expect(fakeClient.release).toHaveBeenCalled();
  });

  it('deve fazer ROLLBACK quando o DELETE do cart falhar', async () => {
    const queriesExecutadas: string[] = [];
    const fakeClient = {
      query: jest.fn(async (sql: string) => {
        queriesExecutadas.push(sql);
        if (sql.startsWith('SELECT')) return { rows: [{ id: '1', product_id: '1', quantity: 1 }], rowCount: 1 };
        if (sql.startsWith('UPDATE')) return { rows: [], rowCount: 1 };
        if (sql.startsWith('DELETE')) throw new Error('falha simulada no DELETE')
        return { rows: [], rowCount: 0 }
      }),
      release: jest.fn()
    };
    const fakePool = {
      connect: jest.fn(async () => fakeClient)
    };
    const service = new CartService(fakePool as any, fakeLogger as any);

    await expect(service.removeFromCart(1)).rejects.toThrow('falha simulada no DELETE');

    expect(queriesExecutadas).toContain('ROLLBACK');
    expect(queriesExecutadas).not.toContain('COMMIT');
    expect(fakeClient.release).toHaveBeenCalled();
  });
});