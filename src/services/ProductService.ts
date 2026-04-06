import { Database } from 'sqlite';

export class ProductService {
  constructor(private db: Database) { }

  async listAll() {
    return await this.db.all('SELECT * FROM products');
  }

  async findById(id: string) {
    const product = await this.db.get('SELECT * FROM products WHERE id = ?', id);

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return product;
  }
}