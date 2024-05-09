import setPageTitle from "./setPageTitle.js"
import form from "./form.js"

const products = {
  key: "products",
  container: document.querySelector("main"),
  renderFallbackMessage: undefined,
  maxPerRow: 6,
  get: undefined,
  list: undefined,
  byCategory: undefined,
  urlId: Number(new URLSearchParams(window.location.search).get("id")),
  urlCategory: new URLSearchParams(window.location.search).get("category") || new URLSearchParams(window.location.search).get("name"),
  productToUpdate: undefined,
  productHTML: undefined,
  add: undefined,
  edit: undefined,
  delete: undefined,
  renderByCategory: undefined,
  renderProductDetailsAndSuggestions: undefined,
  renderAllFromCategory: undefined,
  renderAll: undefined,
}

products.renderFallbackMessage = (message) => {
  if (!message?.trim()) {
    throw new Error("Render Fallback Component: Missing message.")
  }

  products.container.innerHTML += `<p class="products-list-fallback">${message}</p>`
}

products.get = () => {
  const productsData = localStorage.getItem(products.key)

  if (!productsData) {
    fetch("products.json")
      .then(res => res.json())
      .then(list => localStorage.setItem(products.key, JSON.stringify(list)))
      .catch(() => products.renderFallbackMessage("Failed to get posts list. Please, try again later."))
  }

  const list = JSON.parse(productsData)

  if (!list) {
    products.renderFallbackMessage("Failed to get posts list. Please, try again later.")
    return
  }
  
  /* Newest products first */
  list.sort((a, b) => Number(b.id) - Number(a.id))
  products.list = list
}

products.get()
products.byCategory = Object.groupBy(products.list, ({ category }) => category)
products.productToUpdate = products.urlId && Object.entries(products.list.find(product => product.id === products.urlId))
products.productHTML = (product) => `
  <li aria-label="${product.name}">
    <a href="/product.html?id=${product.id}&category=${product.category}" aria-label="See product ${product.name}">
      <img src="${product.image}" alt="${product.name}" role="img">
      <span aria-label="Product name">${product.name}</span>
      <span class="price" aria-label="Product price">${product.price}</span>
      <span class="see-product" aria-hidden="true">See product</span>
    </a>
  </li>
`

products.add = (e) => {
  const newProduct = {
    id: Math.max(...products.list.map(product => product.id)) + 1,
    ...form.data(e)
  }

  localStorage.setItem(products.key, JSON.stringify([newProduct, ...products.list]))
  window.location.href = "/products.html"
}

products.edit = (e) => {
  const listWithUpdatedProduct = products.list.map(product => {
    if (product.id === products.urlId) {
      return { id: product.id, ...form.data(e) }
    }
    return product
  })
  
  localStorage.setItem(products.key, JSON.stringify(listWithUpdatedProduct))
  window.location.href = "/products.html"
}

products.delete = (productId) => {
  const listWithoutProduct = products.list.filter(product => product.id !== Number(productId))
  localStorage.setItem(products.key, JSON.stringify(listWithoutProduct))
  window.location.reload()
}

products.renderByCategory = () => {
  const banner = document.querySelector("div#banner")
  const bannerButton = banner.querySelector("a#see_products")

  if (!products.list?.length > 0) {
    banner.remove()
    products.renderFallbackMessage("No products to show yet.")
    return
  }
  
  const categories = Object.keys(products.byCategory)
  const newBannerButtonCategory = categories[categories.length - 1]
  const formattedCategory = (category) => {
    return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s']+/g, "_").toLowerCase()
  }

  for (const [category, categoryProducts] of Object.entries(products.byCategory)) {
    if (!bannerButton.textContent.includes(category)) {
      bannerButton.href = `#${formattedCategory(newBannerButtonCategory)}`
      bannerButton.textContent = bannerButton.textContent.replace("Consoles", newBannerButtonCategory)
    }

    if (products.byCategory[category].length > 0) {
      products.container.innerHTML += `
        <section id="${formattedCategory(category)}" class="category-section" aria-label="${category} products">
          <div class="products-header">
            <h2 class="products-category">${category}</h2>
            ${products.byCategory[category].length > products.maxPerRow
              ? `<a href="/category.html?name=${category}" class="see-all">See all</a>` : ""}
          </div>
          <ul class="products-list" aria-label="Products">
            ${categoryProducts.map((product, i) => {
              if (i < products.maxPerRow) {
                return products.productHTML(product)
              }
            }).join("")}
          </ul>
        </section>
      `
    }
  }
}

products.renderProductDetailsAndSuggestions = () => {
  if (!products.urlId || !products.list.find(product => product.id === products.urlId)) {
    products.renderFallbackMessage("Product not found.")
  }

  /* Similar Products container rendering */
  if (products.list?.length > 1 && products.urlCategory) {
    products.container.innerHTML += `
      <section class="similar-products" aria-labelledby="similar_products">
        <h2 id="similar_products">Similar Products</h2>
        <ul id="products_list" class="products-list" aria-labelledby="similar_products"></ul>
      </section>
    `
  }
  
  const listElement = document.querySelector("ul#products_list")
  
  /* Product details rendering */
  products.byCategory[products.urlCategory].map((product, i) => {
    if (product.id === products.urlId) {
      setPageTitle(product.name)

      products.container.insertAdjacentHTML("afterbegin", `
        <section class="product-details" aria-label="${product.name}">
          <img src="${product.image}" alt="${product.name}" role="img">
          <div class="info-container">
            <h2 class="name" aria-label="Product name">${product.name}</h2>
            <span class="price" aria-label="Product price">${product.price}</span>
            <p class="description" aria-label="Product description">${product.description || "No description available."}</p>
          </div>
        </section>
      `)
      return
    }

    /* Similar products without detailed product */
    if (i < products.maxPerRow && listElement) {
      listElement.innerHTML += products.productHTML(product)
    }
  })

  /* Filling Similar Products row if not enough products with newest products */
  const notEnoughProductsPerRow = listElement?.childElementCount < products.maxPerRow
  const missingProductsQuantity = products.maxPerRow - listElement?.childElementCount
  const productsFromOtherCategories = products.list.filter(product => product.category !== products.urlCategory)

  if (notEnoughProductsPerRow && productsFromOtherCategories?.length > 0) {
    productsFromOtherCategories.map((product, i) => {
      if (i < missingProductsQuantity) {
        listElement?.insertAdjacentHTML("beforeend", products.productHTML(product))
      }
    })
  }
}

products.renderAllFromCategory = () => {
  setPageTitle(products.urlCategory)

  if (!products.byCategory[products.urlCategory]?.length > 0) {
    products.renderFallbackMessage("Category does not exist, so no products to show.")
    return
  }

  products.container.innerHTML += `
    <section class="category-section" aria-label="${products.urlCategory} products">
      <div class="products-header">
        <h2 class="products-category">${products.urlCategory}</h2>
      </div>
      <ul class="products-list" aria-label="Products">
        ${products.byCategory[products.urlCategory].map(product => products.productHTML(product)).join("")}
      </ul>
    </section>
  `
}

products.renderAll = () => {
  if (!products.list?.length > 0) {
    products.renderFallbackMessage("No products to show yet.")
    return
  }

  products.container.innerHTML += `
    <ul class="products-list all-products" aria-label="Products">
      ${products.list.map(product => `
        <li aria-label="${product.name}">
          <div class="buttons-container" role="none">
            <button type="button" aria-label="Delete ${product.name}" data-delete="${product.id}">
              <svg width="14" height="18" aria-label="Bin" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z"></path>
              </svg>
            </button>
            <a href="/edit_product.html?id=${product.id}" aria-label="Edit ${product.name}">
              <svg width="18" height="18" aria-label="Pen" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M0 14.25V18H3.75L14.81 6.94L11.06 3.19L0 14.25ZM17.71 4.04C18.1 3.65 18.1 3.02 17.71 2.63L15.37 0.289998C14.98 -0.100002 14.35 -0.100002 13.96 0.289998L12.13 2.12L15.88 5.87L17.71 4.04Z"></path>
              </svg>
            </a>
          </div>
          <img src="${product.image}" alt="${product.name}" role="img">
          <span aria-label="Product name">${product.name}</span>
          <span class="price" aria-label="Product price">${product.price}</span>
          <span aria-label="Product id">#${product.id}</span>
        </li>
      `).join("")}
    </ul>
  `

  const deleteButtons = document.querySelectorAll("[data-delete]")
  deleteButtons.forEach(button => button.addEventListener("click", () => products.delete(button.dataset.delete)))
}

const { productToUpdate, add, edit, renderByCategory, renderProductDetailsAndSuggestions, renderAllFromCategory, renderAll } = products
export default { productToUpdate, add, edit, renderByCategory, renderProductDetailsAndSuggestions, renderAllFromCategory, renderAll }
