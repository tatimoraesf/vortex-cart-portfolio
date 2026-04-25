async function init() {
  const response = await fetch('http://localhost:3000/products');
  const data = await response.json();
  console.log(data);
  const section = document.getElementById('products-grid')

  data.forEach(product => {
    section.innerHTML += `<div>${product.name}</div>`
  })
};

init();