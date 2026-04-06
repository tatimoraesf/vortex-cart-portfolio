import Fastify from 'fastify';
import S from 'fluent-json-schema';
import { setupDatabase } from './database';
import { ProductService } from './services/ProductService';
import { CartService } from './services/CartService';

export async function buildServer() {
  const server = Fastify({ logger: false });
  const db = await setupDatabase();
  const productService = new ProductService(db);
  const cartService = new CartService(db);

  (server as any).db = db;

  server.get('/health', async (request, reply) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "vortex-cart"
    }
  })

  server.get('/products', async () => {
    return productService.listAll();
  })

  server.get('/products/:id', async (request, reply) => {
    const { id } = request.params as any;
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);

    if (!product) return reply.status(404).send({ error: 'Produto nao encontrado' });

    return product;
  })

  // ROTA: Adicionar ao Carrinho
  server.post('/cart', {
    schema: {
      body: S.object()
        .prop('product_id', S.string().required())
        .prop('quantity', S.integer().minimum(1).required())
    }
  }, async (request, reply) => {
    const { product_id, quantity } = request.body as any;

    try {
      const result = await cartService.addToCart(product_id, quantity);
      return { message: 'Adicionado com sucesso!', item: result.itemName };
    } catch (error: any) {
      if (error.message === 'PRODUCT_NOT_FOUND') return reply.status(404).send({ error: 'Produto não existe no catálogo' });
      if (error.message === 'INSUFFICIENT_STOCK') return reply.status(422).send({ error: 'Estoque insuficiente' });
      throw error;
    }
  });

  server.get('/cart', async () => {
    return cartService.listItems();
  });

  server.delete('/cart/:id', async (request, reply) => {
    const { id } = request.params as any;

    try {
      await cartService.removeFromCart(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message === 'ITEM_NOT_FOUND') {
        return reply.status(404).send({ error: 'Item nao encontrado no carrinho' });
      }
      throw error;
    }

  });

  // ROTA DE ADMIN: Resetar Banco (Para uso do n8n e Testes)
  server.post('/admin/reset-db', async (request, reply) => {
    const db = (server as any).db;

    // Limpa as tabelas
    await db.run('DELETE FROM cart');
    await db.run('DELETE FROM products');

    // Repopula com dados iniciais para o Smoke Test do n8n sempre passar
    await db.run('INSERT INTO products (id, name, price, inventory) VALUES ("1", "Teclado Mecânico", 150.00, 10)');
    await db.run('INSERT INTO products (id, name, price, inventory) VALUES ("2", "Mouse Gamer", 80.00, 5)');

    return { message: "Banco de dados resetado com sucesso!" };
  });

  return server;
}


if (require.main === module) {
  buildServer().then(app => {
    app.listen({ port: 3000 }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('🚀 Servidor rodando com SQLite em http://localhost:3000')
    });
  });
}