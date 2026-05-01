import { FastifyInstance } from 'fastify';
import { ProductService } from '../services/ProductService';
import S from 'fluent-json-schema';

export async function productRoutes(server: FastifyInstance, options: any) {
  const productService = options.productService as ProductService;

  server.get(
    '/products',
    {
      schema: {
        description: 'Lista todos os produtos do catálogo',
        tags: ['Produtos'],
        response: {
          200: S.array().items(
            S.object()
              .prop('id', S.string())
              .prop('name', S.string())
              .prop('price', S.number())
              .prop('inventory', S.integer()),
          ),
        },
      },
    },
    async () => {
      return await productService.listAll();
    },
  );

  server.get(
    '/products/:id',
    {
      schema: {
        description: 'Busca um produto pelo ID',
        tags: ['Produtos'],
        params: S.object().prop('id', S.string().required().description('ID do produto')),
        response: {
          200: S.object()
            .prop('id', S.string())
            .prop('name', S.string())
            .prop('price', S.number())
            .prop('inventory', S.integer()),
          404: S.object().prop('error', S.string()),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const product = await productService.findById(id);

      if (!product) {
        return reply.status(404).send({ error: 'Produto nao encontrado' });
      }

      return product;
    },
  );
}
