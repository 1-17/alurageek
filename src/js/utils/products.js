import formData from "./formData.js"

const products = {
  _key: "products",
  _renderFallbackComponent: undefined,
  _get: undefined,
  add: undefined,
  edit: undefined,
  delete: undefined,
  renderByCategory: undefined,
  renderProductAndSuggestions: undefined,
  renderAll: undefined
}

const renderContainer = document.querySelector("main")
const maxProductsPerRow = 6

products._renderFallbackComponent = (message) => {
  if (!message || message.trim() === "") {
    throw new Error("Render Fallback Component: Missing message.")
  }

  renderContainer.innerHTML += `<p class="products-list-fallback">${message}</p>`
}

products._get = () => {
  const productsData = localStorage.getItem(products._key)

  if (!productsData) {
    fetch("products.json")
      .then(res => res.json())
      .then(list => localStorage.setItem(products._key, JSON.stringify(list)))
      .catch(() => products._renderFallbackComponent("Failed to get posts list. Please, try again later."))
  }

  const list = JSON.parse(productsData)

  if (list) {
    return list.sort((a, b) => parseInt(b.id) - parseInt(a.id))
  }
}

const productsList = products._get()

products.add = (e) => {
  let newId = Math.max(...productsList.map(product => product.id)) + 1

  const newProduct = {
    id: newId,
    ...formData(e)
  }

  localStorage.setItem(products._key, JSON.stringify([newProduct, ...productsList]))
  window.location.href = "/products.html"
}

products.edit = (productId) => console.log(Number(productId))

products.delete = (productId) => {
  const newList = productsList.filter(product => product.id !== Number(productId))
  localStorage.setItem(products._key, JSON.stringify(newList))
  window.location.href = "/products.html"
}

products.renderByCategory = () => {
  if (productsList && productsList.length > 0) {
    const productsByCategory = Object.groupBy(productsList, ({ category }) => category)

    for (const [category, products] of Object.entries(productsByCategory)) {
      if (productsByCategory[category].length > 0) {
        const categoryId = category.toLowerCase().replace(" ", "-")

        renderContainer.innerHTML += `
          <section id="${categoryId}" class="category-section" aria-label="${category} products">
            <div class="products-header">
              <h2 class="products-category">${category}</h2>
              <a href="/products/${categoryId}.html" class="see-all">See all</a>
            </div>
            <ul class="products-list" aria-label="Products">
              ${products.map((product, i) => {
                if (i < maxProductsPerRow) {
                  return `
                    <li aria-label="${product.name}">
                      <a href="/product.html?id=${product.id}">
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

products.renderProductAndSuggestions = () => {
  let pageTitle = ""
  const productId = Number(new URLSearchParams(window.location.search).get("id"))

  if (!productId || !productsList.find(product => product.id === productId)) {
    products._renderFallbackComponent("Product not found.")
  }

  if (productsList && productsList.length > 1) {
    renderContainer.innerHTML += `
      <section class="similar-products" aria-labelledby="similar_products">
        <h2 id="similar_products">Similar Products</h2>
        <ul id="products_list" class="products-list" aria-labelledby="similar_products"></ul>
      </section>
    `
  }
  
  const listElement = document.querySelector("ul#products_list")

  productsList.map((product, i) => {
    if (product.id === productId) {
      pageTitle = ` | ${product.name}`

      renderContainer.insertAdjacentHTML("afterbegin", `
        <section class="product-details" aria-label="${product.name}">
          <img src="${product.image}" alt="${product.name}" role="img">
          <div class="info-container">
            <h2 class="name">${product.name}</h2>
            <span class="price" role="none">${product.price}</span>
            <p class="description">${product.description}</p>
          </div>
        </section>
      `)
      return
    }

    if (i < maxProductsPerRow) {
      listElement.innerHTML += `
        <li aria-label="${product.name}">
          <a href="/product.html?id=${product.id}">
            <img src="${product.image}" alt="${product.name}" role="img">
            <span>${product.name}</span>
            <span class="price" role="none">${product.price}</span>
            <span class="see-product">See product</span>
          </a>
        </li>
      `
    }
  }).join("")

  if (pageTitle) {
    document.querySelector("title").textContent += pageTitle
    document.querySelectorAll("[name='title']").forEach(property => property.content += pageTitle)
  }
}

products.renderAll = () => {
  if (productsList && productsList.length > 0) {
    renderContainer.innerHTML += `
      <ul class="products-list all-products" aria-label="Products">
        ${productsList.map(product => `
          <li aria-label="${product.name}">
            <div class="buttons-container" role="none">
              <button type="button" aria-label="Delete" data-delete="${product.id}">
                <svg width="14" height="18" aria-label="Bin" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z"></path>
                </svg>
              </button>
              <button type="button" aria-label="Edit" data-edit="${product.id}">
                <svg width="18" height="18" aria-label="Pen" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M0 14.25V18H3.75L14.81 6.94L11.06 3.19L0 14.25ZM17.71 4.04C18.1 3.65 18.1 3.02 17.71 2.63L15.37 0.289998C14.98 -0.100002 14.35 -0.100002 13.96 0.289998L12.13 2.12L15.88 5.87L17.71 4.04Z"></path>
                </svg>
              </button>
            </div>
            <img src="${product.image}" alt="${product.name}" role="img">
            <span>${product.name}</span>
            <span class="price" role="none">${product.price}</span>
            <span>#${product.id}</span>
          </li>
        `).join("")}
      </ul>
    `

    document.querySelectorAll("[data-delete]").forEach(button => {
      button.addEventListener("click", () => products.delete(button.dataset.delete))
    })

    document.querySelectorAll("[data-edit]").forEach(button => {
      button.addEventListener("click", () => products.edit(button.dataset.edit))
    })

    return
  }

  products._renderFallbackComponent("No products to show yet.")
}

export default products