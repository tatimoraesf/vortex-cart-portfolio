import { Pool } from 'pg';

export class CartService {
  constructor(private pool: Pool, private log: any) { }

  async addToCart(productId: string, quantity: number) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const productRes = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
      const product = productRes.rows[0];

      if (!product) throw new Error('PRODUCT_NOT_FOUND');
      const updateRes = await client.query(
        'UPDATE products SET inventory = inventory - $1 WHERE id = $2 AND inventory >= $1',
        [quantity, productId]
      );

      if (updateRes.rowCount === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      await client.query(
        'INSERT INTO cart (product_id, name, quantity) VALUES ($1, $2, $3)',
        [productId, product.name, quantity]
      )

      await client.query('COMMIT');

      return { itemName: product.name };

    } catch (error: any) {
      await client.query('ROLLBACK');

      if (error.message === 'INSUFFICIENT_STOCK' || error.message === 'PRODUCT_NOT_FOUND') {
        throw error;
      }
      this.log.error({ err: error }, 'Erro interno no CartService')

      throw new Error('INTERNAL_ERROR');
    } finally {
      client.release();
    }
  }

  async removeFromCart(cartItemId: number) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const itemRes = await client.query('SELECT * FROM cart WHERE id = $1', [cartItemId]);
      const item = itemRes.rows[0];

      if (!item) throw new Error('ITEM_NOT_FOUND');

      await client.query(
        'UPDATE products SET inventory = inventory + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query('DELETE FROM cart WHERE id = $1', [cartItemId]);

      await client.query('COMMIT');

      return { message: 'Item removido com sucesso!' };
    } catch (error: any) {
      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }

  async listItems() {
    const sql = `
    SELECT cart.id, cart.product_id, cart.name, cart.quantity, products.price
    FROM cart
    JOIN products ON cart.product_id = products.id    
    `;

    const res = await this.pool.query(sql);

    return res.rows;
  }
}