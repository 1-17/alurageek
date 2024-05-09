import session from "../utils/session.js"
import products from "../utils/products.js"

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("a#nav_button").addEventListener("click", session.logout)
  products.renderAll()
})
