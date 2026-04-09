import { FastifyInstance } from "fastify";
import { ProductService } from "../services/ProductService";

export async function productRoutes(server: FastifyInstance, options: any) {
  const productService = options.productService as ProductService;

  server.get('/products', async () => {
    return await productService.listAll();
  });

  server.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const product = await productService.findById(id);

    if (!product) {
      return reply.status(404).send({ error: 'Produto nao encontrado' });
    }

    return product;
  });
};