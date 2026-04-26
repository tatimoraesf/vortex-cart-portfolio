async function init() {
  const response = await fetch('http://localhost:3000/products');
  const data = await response.json();
  const grid = document.getElementById('products-grid')

  data.forEach(product => {
    const inStock = product.inventory > 0;
    grid.innerHTML += `
     <div class="product-card">
        <div class="product-image"></div>
        <div class="product-info">
          <p class="product-name">${product.name}</p>
          <div class="product-meta">
            <span class="product-price">R$ ${Number(product.price).toFixed(2).replace('.', ',')}</span>
            <span class="stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}">
              ${inStock ? product.inventory + ' un.' : 'Esgotado'}
            </span>
          </div>
          <button class="btn-add" onclick="addToCart('${product.id}')" ${!inStock ? 'disabled' : ''}>
            + Adicionar
          </button>
        </div>
      </div>
    `
  })
  await renderCart();
};

async function addToCart(productId) {
  const response = await fetch('http://localhost:3000/cart', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product_id: productId, quantity: 1 })
  })
  const data = await response.json()
  console.log(data)

  const toast = document.getElementById('toast')
  toast.textContent = data.message
  setTimeout(() => { toast.textContent = '' }, 3000)
  await renderCart();
};

async function renderCart() {
  const response = await fetch('http://localhost:3000/cart');
  const data = await response.json();

  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  let total = 0;

  data.forEach(item => {
    total += Number(item.price) * item.quantity;
    cartItems.innerHTML += `
    <div class="cart-item">
    <div class="cart-item-info">
      <p class="cart-item-name">${item.name}</p>
      <p class="cart-item-meta">R$ ${Number(item.price).toFixed(2).replace('.', ',')} · ${item.quantity} un.</p>
    </div>
    <button class="btn-remove" onclick="removeFromCart('${item.id}')">✕</button>
  </div>
    `
  });
  document.getElementById('cart-total').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');
  document.getElementById('cart-count').textContent = data.length;
};

async function removeFromCart(cartId) {
  await fetch(`http://localhost:3000/cart/${cartId}`, {
    method: "DELETE"
  });

  renderCart();
}

init();