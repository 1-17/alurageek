const products = {
  _key: "products",
  get: undefined,
  set: undefined,
  remove: undefined,
  render: undefined
}

const productsData = localStorage.getItem(products._key)

products.get = () => {
  if (!productsData) {
    fetch("src/products.json")
      .then(res => res.json())
      .then(res => localStorage.setItem(products._key, JSON.stringify(res)))
      .catch(err => console.error(err))
  }
  
  return JSON.parse(productsData).sort((a, b) => parseInt(b.id) - parseInt(a.id))
}

const productsList = products.get()

products.set = () => {
  const newItem = {
    "id": "4",
    "name": "Product IV",
    "image": "https://i.ytimg.com/vi/hUE6Haw_3zg/hqdefault.jpg?sqp=-oaymwEXCOADEI4CSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCoKZLqgIojU6sqxPnZydABdpSZ-A",
    "category": "Test",
    "description": "Product IV",
    "price": "100.00"
  }

  localStorage.setItem(products._key, JSON.stringify([...productsList, newItem]))
}

products.remove = (productId) => {
  const newList = productsList.filter(product => product.id !== productId)
  localStorage.setItem(products._key, JSON.stringify(newList))
}

products.render = () => {
  const parentElement = document.querySelector("main")

  if (productsList && productsList.length > 0) {
    const productsByCategory = Object.groupBy(productsList, ({ category }) => category)

    for (const [category, products] of Object.entries(productsByCategory)) {
      if (productsByCategory[category].length > 0) {
        const categoryId = category.toLowerCase().replace(" ", "-")

        parentElement.innerHTML += `
          <section aria-label="${category} products">
            <div class="products-header">
              <h2 class="products-category">${category}</h2>
              <a href="/products/${categoryId}.html" class="products-link see-all">See all</a>
            </div>
            <ul class="products-list" aria-label="Products">
              ${
                products.map(product => `
                  <li>
                    <img src="${product.image}" alt="${product.name}" role="img">
                    <span>${product.name}</span>
                    <span class="price" role="none">${product.price}</span>
                    <a href="/product/${product.id}" class="products-link">See product</a>
                  </li>
                `).join("")
              }
            </ul>
          </section>
        `
      }
    }
  }
}

export default products
