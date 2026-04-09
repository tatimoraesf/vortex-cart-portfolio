import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function setupDatabase() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        inventory INTEGER NOT NULL DEFAULT 0,
        price DECIMAL(10,2) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        product_id TEXT REFERENCES products(id),
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL
      );
    `);
    const res = await client.query('SELECT * FROM products LIMIT 1');
    if (res.rowCount === 0) {
      await client.query('INSERT INTO products (id, name, inventory, price) VALUES ($1, $2, $3, $4)', ['1', 'Teclado Mecânico', 5, 99.99]);
      await client.query('INSERT INTO products (id, name, inventory, price) VALUES ($1, $2, $3, $4)', ['2', 'Mouse Gamer', 0, 49.99]);
    }
  } finally {
    client.release();
  }
}