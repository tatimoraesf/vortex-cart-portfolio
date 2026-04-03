import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupDatabase() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      inventory INTEGER,
      price REAL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      name TEXT,
      quantity INTEGER,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  const products = await db.all('SELECT * FROM products');
  if (products.length === 0) {
    // Agora passamos 4 pontos de interrogação porque temos 4 colunas (id, name, inventory, price)
    await db.run('INSERT INTO products (id, name, inventory, price) VALUES (?, ?, ?, ?)', '1', 'Teclado Mecânico', 5, 99.99);
    await db.run('INSERT INTO products (id, name, inventory, price) VALUES (?, ?, ?, ?)', '2', 'Mouse Gamer', 0, 49.99);
  }

  return db;
}