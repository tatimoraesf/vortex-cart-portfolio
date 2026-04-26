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
<button ${product.inventory === 0 ? 'disabled' : ''}>Adicionar ao carrinho</button>
    </div> 
    `
  })
};

init();