import setPageTitle from "./setPageTitle.js"
import form from "./form.js"

const products = {
  key: "products",
  container: document.querySelector("main"),
  placeholderImage: "src/assets/img/placeholder.svg",
  renderFallbackMessage: undefined,
  isFallbackMessageRendered: false,
  maxPerRow: 6,
  get: undefined,
  list: undefined,
  byCategory: undefined,
  urlId: Number(new URLSearchParams(window.location.search).get("id")),
  urlCategory: new URLSearchParams(window.location.search).get("category") || new URLSearchParams(window.location.search).get("name"),
  urlSearch: new URLSearchParams(window.location.search).get("search"),
  productToUpdate: undefined,
  formatToPrice: undefined,
  productHTML: undefined,
  add: undefined,
  edit: undefined,
  delete: undefined,
  search: undefined,
  renderByCategory: undefined,
  renderProductDetailsAndSuggestions: undefined,
  renderAllFromCategory: undefined,
  renderAll: undefined,
  renderSearch: undefined,
}

products.renderFallbackMessage = (message, position) => {
  if (!message?.trim()) {
    throw new Error("Render Fallback Component: Missing message.")
  }

  products.isFallbackMessageRendered = true
  const htmlMessage = `<p class="fallback-message">${message}</p>`

  if (position) {
    products.container.insertAdjacentHTML(position, htmlMessage)
    return
  }

  products.container.innerHTML += htmlMessage
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

products.byCategory = products.list && Object.groupBy(products.list, ({ category }) => category)

products.productToUpdate = (
  products.urlId
  && window.location.href.includes("edit_product")
  && products.list?.find(product => product.id === products.urlId)
) && Object.entries(products.list.find(product => product.id === products.urlId))

if (!products.productToUpdate) {
  document.querySelector("form#edit_product").remove()
  products.renderFallbackMessage("Product to edit is not found.")
}

products.formatToPrice = (price) => {
  if (!price) {
    throw new Error("Format To Price: Missing price argument.")
  }

  price = parseFloat(price).toLocaleString("en-US", { style: "currency", currency: "USD" })

  return price
}

products.productHTML = (product) => {
  return `
    <li aria-label="${product.name}">
      <a href="/alurageek/product?id=${product.id}" aria-label="See product ${product.name}">
        <img src="${product.image || products.placeholderImage}" alt="${product.name}" role="img">
        <span aria-label="Product name">${product.name}</span>
        <span class="price" aria-label="Product price">${products.formatToPrice(product.price)}</span>
        <span class="see-product" aria-hidden="true">See product</span>
      </a>
    </li>
  `
}

products.add = (e) => {
  const formData = form.data(e)
  const productsIds = []

  for (const { id, name, category } of products.list) {
    const productAlreadyExists = name === formData.name && category === formData.category

    if (productAlreadyExists) {
      products.container = document.querySelector("form#add_product button")
      
      if (!products.isFallbackMessageRendered) {
        products.renderFallbackMessage("Product already exists with same name and category.", "beforebegin")
      }
      return
    }

    productsIds.push(id)
  }

  const newProduct = { id: Math.max(...productsIds) + 1, ...formData }
  localStorage.setItem(products.key, JSON.stringify([newProduct, ...products.list]))
  window.location.href = "/alurageek/products"
}

products.edit = (e) => {
  const listWithUpdatedProduct = []

  for (let { id, ...product } of products.list) {
    const formData = form.data(e)
    let isProductEdited

    if (id === products.urlId) {
      isProductEdited = JSON.stringify(product) === JSON.stringify(formData)
      product = { id, ...formData }
    }
    
    if (isProductEdited) {
      products.container = document.querySelector("form#edit_product button")

      if (!products.isFallbackMessageRendered) {
        products.renderFallbackMessage("Product was not edited since it has no changes.", "beforebegin")
      }
      return
    }
    
    listWithUpdatedProduct.push({ id, ...product })
  }
  
  localStorage.setItem(products.key, JSON.stringify(listWithUpdatedProduct))
  window.location.href = "/alurageek/products"
}

products.delete = (productId) => {
  const listWithoutProduct = products.list.filter(product => product.id !== Number(productId))
  localStorage.setItem(products.key, JSON.stringify(listWithoutProduct))
  window.location.reload()
}

products.search = (e) => {
  const searchedTerm = form.data(e).search
  window.location.href = `/alurageek/search_product?search=${searchedTerm}`
}

products.renderByCategory = () => {
  const banner = document.querySelector("div#banner")
  const bannerButton = banner.querySelector("a#see_products")

  if (!products.list || !products.byCategory) {
    banner.remove()
    return
  }

  if (!products.list.length > 0) {
    banner.remove()
    products.renderFallbackMessage("No products to show yet.")
    return
  }
  
  const categories = Object.keys(products.byCategory)
  const newBannerButtonCategory = categories[categories.length - 1]
  const formattedCategory = (category) => {
    return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s']+/g, "_").toLowerCase()
  }

  if (!products.byCategory[bannerButton.textContent.replace("See ", "")]) {
    bannerButton.href = `#${formattedCategory(newBannerButtonCategory)}`
    bannerButton.textContent = bannerButton.textContent.replace("Consoles", newBannerButtonCategory)
  }

  for (const [category, categoryProducts] of Object.entries(products.byCategory)) {
    if (products.byCategory[category].length > 0) {
      products.container.innerHTML += `
        <section id="${formattedCategory(category)}" class="category-section" aria-label="${category} products">
          <div class="products-header">
            <h2 class="products-category">${category}</h2>
            ${products.byCategory[category].length > products.maxPerRow
              ? `<a href="/alurageek/category?name=${category}" class="see-all">See all</a>` : ""}
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
  if (!products.list || !products.byCategory) {
    return
  }

  const detailedProduct = products.list.find(product => product.id === products.urlId)
  const similarProducts = []
  
  if (!products.urlId || !detailedProduct) {
    products.renderFallbackMessage("Product not found.")
  }

  /* Product details rendering */
  if (detailedProduct) {
    setPageTitle(detailedProduct.name)

    products.container.insertAdjacentHTML("afterbegin", `
      <section class="product-details" aria-label="${detailedProduct.name}">
        <img src="${detailedProduct.image || products.placeholderImage}" alt="${detailedProduct.name}" role="img">
        <div class="info-container">
          <h2 class="name" aria-label="Product name">${detailedProduct.name}</h2>
          <span class="price" aria-label="Product price">${products.formatToPrice(detailedProduct.price)}</span>
          <p class="description" aria-label="Product description">${detailedProduct.description || "No description available."}</p>
        </div>
      </section>
    `)

    /* Getting similar products from same category as detailed product */
    for (const product of products.byCategory[detailedProduct.category]) {
      const i = products.byCategory[detailedProduct.category].indexOf(product)
  
      if (product !== detailedProduct && i <= products.maxPerRow) {
        similarProducts.push(product)
      }
    }
  }

  /* Adding more similar products from any categories until row is filled */
  const isRowNotFilled = similarProducts.length < products.maxPerRow
  const quantityToFillRow = products.maxPerRow - similarProducts.length

  if (isRowNotFilled) {
    for (const product of products.list) {
      const i = products.list.indexOf(product)

      if (product.category !== detailedProduct.category && i < quantityToFillRow) {
        similarProducts.push(product)
      }
    }
  }

  /* Similar products rendering */
  if (products.list.length > 1) {
    products.container.innerHTML += `
      <section class="similar-products" aria-labelledby="similar_products">
        <h2 id="similar_products">Similar Products</h2>
        <ul id="products_list" class="products-list" aria-labelledby="similar_products">
          ${similarProducts.map(product => products.productHTML(product)).join("")}
        </ul>
      </section>
    `
  }
}

products.renderAllFromCategory = () => {
  if (!products.byCategory) {
    return
  }

  const productsByCategory = products.byCategory[products.urlCategory]

  if (!productsByCategory?.length > 0) {
    products.renderFallbackMessage("Category does not exist, so no products to show.")
    return
  }

  setPageTitle(products.urlCategory)

  products.container.innerHTML += `
    <section class="category-section" aria-label="${products.urlCategory} products">
      <div class="products-header">
        <h2 class="products-category">${products.urlCategory}</h2>
      </div>
      <ul class="products-list" aria-label="Products">
        ${productsByCategory.map(product => products.productHTML(product)).join("")}
      </ul>
    </section>
  `
}

products.renderAll = () => {
  if (!products.list) {
    return
  }

  if (!products.list.length > 0) {
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
            <a href="/alurageek/edit_product?id=${product.id}" aria-label="Edit ${product.name}">
              <svg width="18" height="18" aria-label="Pen" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M0 14.25V18H3.75L14.81 6.94L11.06 3.19L0 14.25ZM17.71 4.04C18.1 3.65 18.1 3.02 17.71 2.63L15.37 0.289998C14.98 -0.100002 14.35 -0.100002 13.96 0.289998L12.13 2.12L15.88 5.87L17.71 4.04Z"></path>
              </svg>
            </a>
          </div>
          <img src="${product.image || products.placeholderImage}" alt="${product.name}" role="img">
          <span aria-label="Product name">${product.name}</span>
          <span class="price" aria-label="Product price">${products.formatToPrice(product.price)}</span>
          <span aria-label="Product id">#${product.id}</span>
        </li>
      `).join("")}
    </ul>
  `

  const deleteButtons = document.querySelectorAll("[data-delete]")
  deleteButtons.forEach(button => button.addEventListener("click", () => products.delete(button.dataset.delete)))
}

products.renderSearch = () => {
  if (!products.list) {
    return
  }

  if (!products.urlSearch?.trim()) {
    products.renderFallbackMessage("Search is empty. Please, insert a search value.")
    return
  }

  products.container.innerHTML += `
    <section id="search_container" class="category-section" aria-labelledby="search_title">
      <div class="products-header">
        <h2 id="search_title" class="products-category">Search results for '${products.urlSearch}'</h2>
      </div>
    </section>
  `

  const productsFound = []

  for (const product of products.list) {
    for (let [key, value] of Object.entries(product)) {
      if (!key.includes("image")) {
        value = value.toString().toLowerCase()
        const searchValue = products.urlSearch.toLowerCase()

        if (value.includes(searchValue)) {
          productsFound.push(product)
          break
        }
      }
    }
  }

  if (!productsFound.length > 0) {
    products.renderFallbackMessage("No products found.")
    return
  }

  products.container = document.querySelector("section#search_container")
  products.container.innerHTML += `
    <ul class="products-list" aria-label="Products">
      ${productsFound.map(product => products.productHTML(product)).join("")}
    </ul>
  `
}

const {
  productToUpdate,
  add, edit, search,
  renderByCategory, renderProductDetailsAndSuggestions, renderAllFromCategory, renderAll, renderSearch
} = products
export default {
  productToUpdate,
  add, edit, search,
  renderByCategory, renderProductDetailsAndSuggestions, renderAllFromCategory, renderAll, renderSearch
}
