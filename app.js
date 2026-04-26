async function init() {
  const response = await fetch('http://localhost:3000/products');
  const data = await response.json();
  console.log(data);
  const section = document.getElementById('products-grid')

  data.forEach(product => {
    section.innerHTML += `
    <div class="product-card">
    <p>${product.name}</p>
    <p>${product.price}</p>
    <p>${product.inventory}</p>
    <button onClick="addToCart('${product.id}')"
    ${product.inventory === 0 ? 'disabled' : ''}
    >
    Adicionar ao carrinho
    </button>
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

  data.forEach(item => {
    cartItems.innerHTML += `
    <div class="cart-items">
    <p> ${item.product_id}</p>
    <p>Quantidade: ${item.quantity}</p>
    <button onClick="removeFromCart('${item.id}')">Remover</button>
    </div>
    `
  });
};

async function removeFromCart(cartId) {
  await fetch(`http://localhost:3000/cart/${cartId}`, {
    method: "DELETE"
  });

  renderCart();
}

init();