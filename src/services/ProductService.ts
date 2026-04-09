import { Pool } from "pg";

export class ProductService {
  constructor(private pool: Pool) { }


  async listAll() {
    const res = await this.pool.query('SELECT * FROM products');
    return res.rows;
  }

  async findById(id: string) {
    const res = await this.pool.query('SELECT * FROM products WHERE id = $1', [id])
    const product = res.rows[0];

    if (!product) {
      return null
    }

    return product;
  }
}