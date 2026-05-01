import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  iterations: 10,
};

export default function () {
  const response = http.post('http://localhost:3000/cart',
    JSON.stringify({ product_id: "2", quantity: 1 }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(response, {
    'status é 200 ou 422': (r) => r.status === 200 || r.status === 422
  });
};