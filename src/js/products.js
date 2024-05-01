const products = {
  _key: "products",
  _renderFallbackComponent: undefined,
  get: undefined,
  set: undefined,
  remove: undefined,
  renderByCategory: undefined
}

let parentRenderElement = document.querySelector("main")

products._renderFallbackComponent = (message) => {
  if (!message || message.trim() === "") {
    throw new Error("Render Fallback Component: Missing message.")
  }

  parentRenderElement.innerHTML = `<p class="products-list-fallback">${message}</p>`
}

products.get = () => {
  const productsData = localStorage.getItem(products._key)

  if (!productsData) {
    fetch("src/products.json")
      .then(res => res.json())
      .then(res => localStorage.setItem(products._key, JSON.stringify(res)))
      .catch(err => {
        console.error(err)
        products._renderFallbackComponent("Failed to get posts list. Please, try again later.")
      })
  }

  const list = JSON.parse(productsData)

  if (list) {
    return list.sort((a, b) => parseInt(b.id) - parseInt(a.id))
  }
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

products.renderByCategory = () => {
  if (productsList && productsList.length > 0) {
    const productsByCategory = Object.groupBy(productsList, ({ category }) => category)

    for (const [category, products] of Object.entries(productsByCategory)) {
      if (productsByCategory[category].length > 0) {
        const categoryId = category.toLowerCase().replace(" ", "-")
        const maxProducts = 6

        parentRenderElement.innerHTML += `
          <section aria-label="${category} products">
            <div class="products-header">
              <h2 class="products-category">${category}</h2>
              <a href="/products/${categoryId}.html" class="see-all">See all</a>
            </div>
            <ul class="products-list" aria-label="Products">
              ${products.map((product, i) => {
                if (i < maxProducts) {
                  return `
                    <li>
                      <a href="/product/${product.id}">
                        <img src="${product.image}" alt="${product.name}" role="img">
                        <span>${product.name}</span>
                        <span class="price" role="none">${product.price}</span>
                        <span class="see-product">See product</span>
                      </a>
                    </li>
                  `
                }
              }).join("")}
            </ul>
          </section>
        `
      }
    }
    return
  }

  products._renderFallbackComponent("No products to show yet.")
}

export default products
