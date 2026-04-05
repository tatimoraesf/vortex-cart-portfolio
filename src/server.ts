import Fastify from 'fastify';
import S from 'fluent-json-schema';
import { setupDatabase } from './database';

export async function buildServer() {
  const server = Fastify({ logger: false });
  const db = await setupDatabase();

  (server as any).db = db;

  server.get('/health', async (request, reply) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "vortex-cart"
    }
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

    if (quantity <= 0) return reply.status(400).send({ error: 'Quantidade inválida' });

    const produto = await db.get('SELECT * FROM products WHERE  id = ?', product_id);

    if (!produto) return reply.status(404).send({ error: 'Produto não existe no catálogo' });

    if (produto.inventory < quantity) return reply.status(422).send({ error: 'Estoque insuficiente' });

    await db.run('INSERT INTO cart (product_id, name, quantity) VALUES (?, ?, ?)',
      product_id, produto.name, quantity
    );

    await db.run('UPDATE products SET inventory = inventory - ? WHERE id = ? AND inventory >= ?',
      quantity, product_id, quantity);

    return { message: 'Adicionado com sucesso!', item: produto.name };
  });

  server.get('/products', async (request, reply) => {
    const products = await (server as any).db.all('SELECT * FROM products');
    return products;
  })

  server.get('/products/:id', async (request, reply) => {
    const { id } = request.params as any;
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);

    if (!product) return reply.status(404).send({ error: 'Produto nao encontrado' });

    return product;
  })

  server.get('/cart', async () => {
    const sql = `
    SELECT 
      cart.id, 
      cart.product_id, 
      cart.name, 
      cart.quantity, 
      products.price 
    FROM cart 
    JOIN products ON cart.product_id = products.id
  `;
    return await db.all(sql);
  });

  server.delete('/cart/:id', async (request, reply) => {
    const { id } = request.params as any;

    const itemNoCarrinho = await db.get('SELECT * FROM cart WHERE id = ?', id);

    if (!itemNoCarrinho) {
      return reply.status(404).send({ error: 'Item nao encontrado no carrinho' });
    }

    await db.run('UPDATE products SET inventory = inventory + ? WHERE id = ?', itemNoCarrinho.quantity, itemNoCarrinho.product_id);

    await db.run('DELETE FROM cart WHERE id = ?', id);

    return reply.status(204).send();

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