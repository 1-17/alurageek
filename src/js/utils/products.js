import form from "./form.js"

const products = {
  key: "products",
  renderFallback: undefined,
  get: undefined,
  list: undefined,
  add: undefined,
  edit: undefined,
  delete: undefined,
  renderByCategory: undefined,
  renderProductDetailsAndSuggestions: undefined,
  renderAllFromCategory: undefined,
  renderAll: undefined,
}

const productsListContainer = document.querySelector("main")
const maxProductsPerRow = 6

products.renderFallback = (message) => {
  if (!message.trim()) {
    throw new Error("Render Fallback Component: Missing message.")
  }

  productsListContainer.innerHTML += `<p class="products-list-fallback">${message}</p>`
}

products.get = () => {
  const productsData = localStorage.getItem(products.key)

  if (!productsData) {
    fetch("products.json")
      .then(res => res.json())
      .then(list => localStorage.setItem(products.key, JSON.stringify(list)))
      .catch(() => products.renderFallback("Failed to get posts list. Please, try again later."))
  }

  const list = JSON.parse(productsData)

  if (list) {
    return list.sort((a, b) => parseInt(b.id) - parseInt(a.id))
  }
}

products.list = products.get()

products.add = (e) => {
  const formData = {}

  for (const [key, value] of Object.entries(form.data(e))) {
    formData[key.replace("product_", "")] = value
  }

  const newProduct = {
    id: Math.max(...products.list.map(product => product.id)) + 1,
    ...formData
  }

  localStorage.setItem(products.key, JSON.stringify([newProduct, ...products.list]))
  window.location.href = "/products.html"
}

products.edit = (productId) => console.log(Number(productId))

products.delete = (productId) => {
  const newList = products.list.filter(product => product.id !== Number(productId))
  localStorage.setItem(products.key, JSON.stringify(newList))
  window.location.reload()
}

const productsByCategory = Object.groupBy(products.list, ({ category }) => category)

products.renderByCategory = () => {
  const banner = document.querySelector("div#banner")
  const bannerButton = banner.querySelector("a#see_products")
  
  if (products.list && products.list.length > 0) {
    const categories = Object.keys(productsByCategory)
    const newBannerButtonCategory = categories[categories.length - 1]
    const formattedCategory = (category) => {
      return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s']+/g, "_").toLowerCase()
    }

    for (const [category, products] of Object.entries(productsByCategory)) {
      if (!bannerButton.textContent.includes(category)) {
        bannerButton.href = `#${formattedCategory(newBannerButtonCategory)}`
        bannerButton.textContent = bannerButton.textContent.replace("Consoles", newBannerButtonCategory)
      }

      if (productsByCategory[category].length > 0) {
        productsListContainer.innerHTML += `
          <section id="${formattedCategory(category)}" class="category-section" aria-label="${category} products">
            <div class="products-header">
              <h2 class="products-category">${category}</h2>
              ${productsByCategory[category].length > maxProductsPerRow
                ? `<a href="/category.html?name=${category}" class="see-all">See all</a>` : ""
              }
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

  banner.remove()
  products.renderFallback("No products to show yet.")
}

products.renderProductDetailsAndSuggestions = () => {
  let pageTitle = ""
  const productId = Number(new URLSearchParams(window.location.search).get("id"))

  if (!productId || !products.list.find(product => product.id === productId)) {
    products.renderFallback("Product not found.")
  }

  /* Similar Products container rendering */
  if (products.list && products.list.length > 1) {
    productsListContainer.innerHTML += `
      <section class="similar-products" aria-labelledby="similar_products">
        <h2 id="similar_products">Similar Products</h2>
        <ul id="products_list" class="products-list" aria-labelledby="similar_products"></ul>
      </section>
    `
  }
  
  const listElement = document.querySelector("ul#products_list")

  products.list.map((product, i) => {
    if (product.id === productId) {
      pageTitle = ` | ${product.name}`

      /* Product Details rendering */
      productsListContainer.insertAdjacentHTML("afterbegin", `
        <section class="product-details" aria-label="${product.name}">
          <img src="${product.image}" alt="${product.name}" role="img">
          <div class="info-container">
            <h2 class="name">${product.name}</h2>
            <span class="price" role="none">${product.price}</span>
            <p class="description">${product.description || "No description available."}</p>
          </div>
        </section>
      `)
      return
    }

    /* Similar products without current product */
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

products.renderAllFromCategory = () => {
  const category = new URLSearchParams(window.location.search).get("name")

  if (productsByCategory[category]) {
    productsListContainer.innerHTML += `
      <section class="category-section" aria-label="${category} products">
        <div class="products-header">
          <h2 class="products-category">${category}</h2>
        </div>
        <ul class="products-list" aria-label="Products">
          ${productsByCategory[category].map(product => `
            <li aria-label="${product.name}">
              <a href="/product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" role="img">
                <span>${product.name}</span>
                <span class="price" role="none">${product.price}</span>
                <span class="see-product">See product</span>
              </a>
            </li>
          `).join("")}
        </ul>
      </section>
    `
    return
  }

  products.renderFallback("Category does not exist, so no products to show.")
}

products.renderAll = () => {
  if (products.list && products.list.length > 0) {
    productsListContainer.innerHTML += `
      <ul class="products-list all-products" aria-label="Products">
        ${products.list.map(product => `
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

  products.renderFallback("No products to show yet.")
}

const { add, renderByCategory, renderProductDetailsAndSuggestions, renderAllFromCategory, renderAll } = products
export default { add, renderByCategory, renderProductDetailsAndSuggestions, renderAllFromCategory, renderAll }
