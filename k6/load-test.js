import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95) < 500'],
    http_req_failed: ['rate<0.6'],
  }
};

export default function () {
  http.get('http://localhost:3000');
  http.post('http://localhost:3000/cart',
    JSON.stringify({ product_id: "1", quantity: 1 }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  sleep(0.2);
};