import session from "../utils/session.js"
import products from "../utils/products.js"

document.addEventListener("DOMContentLoaded", () => {
  const navButton = document.querySelector("a#nav_button")

  if (session.isLogged) {
    navButton.innerHTML = "Admin menu"
    navButton.href = "/products.html"
  }

  products.renderByCategory()
})
