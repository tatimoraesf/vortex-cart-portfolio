import { Database } from 'sqlite';

export class CartService {
  constructor(private db: Database) { }

  async addToCart(productId: string, quantity: number) {
    const product = await this.db.get('SELECT * FROM products WHERE id = ?', productId);

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    if (product.inventory < quantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    await this.db.run(
      'INSERT INTO cart (product_id, name, quantity) VALUES (?, ?, ?)',
      productId, product.name, quantity
    );

    await this.db.run(
      'UPDATE products SET inventory = inventory - ? WHERE id = ?',
      quantity, productId
    );
    return { itemName: product.name };
  }

  async removeFromCart(cartItemId: string) {
    const item = await this.db.get('SELECT * FROM cart WHERE id = ?', cartItemId);

    if (!item) {
      throw new Error('ITEM_NOT_FOUND');
    }

    await this.db.run(
      'UPDATE products SET inventory = inventory + ? WHERE id = ?',
      item.quantity, item.product_id
    );

    await this.db.run('DELETE FROM cart WHERE id = ?', cartItemId);

    return { message: 'Item removido com sucesso!' };
  }

  async listItems() {
    const sql = `
    SELECT cart.id, cart.product_id, cart.name, cart.quantity, products.price
    FROM cart
    JOIN products ON cart.product_id = products.id    
    `;


    return await this.db.all(sql);
  }
}