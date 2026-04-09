import { FastifyInstance } from "fastify";
import S from 'fluent-json-schema';
import { CartService } from "../services/CartService";

export async function cartRoutes(server: FastifyInstance, options: any) {
  const cartService = options.cartService as CartService;

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
    return await cartService.listItems();
  });

  server.delete('/cart/:id', async (request, reply) => {
    const params = request.params as { id: string };
    const idParam = params.id;

    try {
      const idParaRemover = parseInt(idParam, 10);

      if (isNaN(idParaRemover)) {
        return reply.status(400).send(({ error: 'ID inválido' }))
      }

      await cartService.removeFromCart(idParaRemover);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(404).send({ error: 'Item nao encontrado no carrinho' });
    }
  });
};